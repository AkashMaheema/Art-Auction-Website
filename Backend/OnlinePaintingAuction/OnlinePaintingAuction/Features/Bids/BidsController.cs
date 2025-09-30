using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.Features.Auctions;
using OnlinePaintingAuction.Api.Features.Paintings;
using OnlinePaintingAuction.Api.Models;
using System.Security.Claims;

namespace OnlinePaintingAuction.Api.Features.Bids
{
    [ApiController]
    [Route("api/auctions/{auctionId:int}/paintings/{paintingId:int}/bids")]
    public class BidsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public BidsController(AppDbContext db) => _db = db;

        private static bool IsAuctionLive(Auction a, DateTime nowUtc)
            => a.Status == AuctionStatus.Live && nowUtc >= a.StartsAtUtc && nowUtc <= a.EndsAtUtc;

        // ====== List bids for a painting within an auction (Admin & Bidder) ======
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BidDto>>> List(int auctionId, int paintingId)
        {
            // Validate auction + painting + membership
            var auction = await _db.Auctions
                .AsNoTracking()
                .Include(a => a.Paintings)
                .FirstOrDefaultAsync(a => a.Id == auctionId);
            if (auction is null) return NotFound("Auction not found.");

            if (!auction.Paintings.Any(p => p.Id == paintingId))
                return BadRequest("Painting is not part of this auction.");

            var bids = await _db.Bids
                .AsNoTracking()
                .Where(b => b.AuctionId == auctionId && b.PaintingId == paintingId)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.PlacedAtUtc)
                .Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionId = b.AuctionId,
                    PaintingId = b.PaintingId,
                    Amount = b.Amount,
                    BidderName = b.BidderName,
                    BidderEmail = b.BidderEmail,
                    PlacedAtUtc = b.PlacedAtUtc
                })
                .ToListAsync();

            return Ok(bids);
        }

        // ====== Place a bid (Bidder & Admin) ======
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpPost]
        public async Task<ActionResult<BidDto>> Place(int auctionId, int paintingId, [FromBody] CreateBidRequest req)
        {
            if (req.Amount <= 0) return BadRequest("Amount must be positive.");

            var now = DateTime.UtcNow;

            // Load auction + membership
            var auction = await _db.Auctions
                .Include(a => a.Paintings)
                .FirstOrDefaultAsync(a => a.Id == auctionId);
            if (auction is null) return NotFound("Auction not found.");

            if (!auction.Paintings.Any(p => p.Id == paintingId))
                return BadRequest("Painting is not part of this auction.");

            // Auction must be live and in time window
            if (!IsAuctionLive(auction, now))
                return BadRequest("Bidding is not open for this auction.");

            // Load painting (for MinBid)
            var painting = await _db.Paintings.AsNoTracking().FirstOrDefaultAsync(p => p.Id == paintingId);
            if (painting is null) return NotFound("Painting not found.");

            // Highest existing bid (server-side with cast)
            var highest = await _db.Bids
                .AsNoTracking()
                .Where(b => b.AuctionId == auctionId && b.PaintingId == paintingId)
                .OrderByDescending(b => (double)b.Amount)     // cast to REAL for SQLite
                .Select(b => (decimal?)b.Amount)
                .FirstOrDefaultAsync() ?? 0m;

            var minRequired = Math.Max(painting.MinBid, highest + 0.01m);
            if (req.Amount < minRequired)
                return BadRequest($"Bid must be >= {minRequired:0.00} (minBid: {painting.MinBid:0.00}, current: {highest:0.00}).");

            // Resolve bidder from token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Invalid user.");

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null) return Unauthorized("User not found.");

            var bid = new Bid
            {
                AuctionId = auctionId,
                PaintingId = paintingId,
                UserId = user.Id,
                BidderName = user.Name,
                BidderEmail = user.Email,
                Amount = req.Amount,
                PlacedAtUtc = now
            };

            _db.Bids.Add(bid);
            await _db.SaveChangesAsync();

            var dto = new BidDto
            {
                Id = bid.Id,
                AuctionId = bid.AuctionId,
                PaintingId = bid.PaintingId,
                Amount = bid.Amount,
                BidderName = bid.BidderName,
                BidderEmail = bid.BidderEmail,
                PlacedAtUtc = bid.PlacedAtUtc
            };
            return CreatedAtAction(nameof(List), new { auctionId, paintingId }, dto);


        }
        // List ALL bids for a painting across all auctions
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet("/api/paintings/{paintingId:int}/bids")]
        public async Task<ActionResult<IEnumerable<BidDto>>> ListAllForPainting(
            int paintingId,
            [FromQuery] int? auctionId,           // optional filter to a single auction
            [FromQuery] string? sort = "time",    // "time" | "amount"
            [FromQuery] string? dir = "desc"      // "asc" | "desc"
        )
        {
            // ensure painting exists
            var paintingExists = await _db.Paintings
                .AsNoTracking()
                .AnyAsync(p => p.Id == paintingId);
            if (!paintingExists) return NotFound("Painting not found.");

            var q = _db.Bids.AsNoTracking().Where(b => b.PaintingId == paintingId);

            if (auctionId.HasValue)
                q = q.Where(b => b.AuctionId == auctionId.Value);

            // --- sort ---
            var s = (sort ?? "time").Trim().ToLowerInvariant();
            var d = (dir ?? "desc").Trim().ToLowerInvariant();

            // NOTE: if you mapped Bid.Amount to REAL (double) for SQLite via HasConversion<double>(),
            // ORDER BY Amount works server-side. Otherwise prefer ordering by time.
            if (s == "amount")
            {
                q = d == "asc" ? q.OrderBy(b => b.Amount).ThenBy(b => b.PlacedAtUtc)
                               : q.OrderByDescending(b => b.Amount).ThenByDescending(b => b.PlacedAtUtc);
            }
            else // time
            {
                q = d == "asc" ? q.OrderBy(b => b.PlacedAtUtc)
                               : q.OrderByDescending(b => b.PlacedAtUtc);
            }

            var items = await q
                .Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionId = b.AuctionId,
                    PaintingId = b.PaintingId,
                    Amount = b.Amount,
                    BidderName = b.BidderName,
                    BidderEmail = b.BidderEmail,
                    PlacedAtUtc = b.PlacedAtUtc
                })
                .ToListAsync();

            return Ok(items);
        }
        // DELETE /api/bids/{id}
        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("/api/bids/{id:int}")]
        public async Task<ActionResult> DeleteById(int id)
        {
            var b = await _db.Bids.FirstOrDefaultAsync(x => x.Id == id);
            if (b is null) return NotFound();

            _db.Bids.Remove(b);
            await _db.SaveChangesAsync();
            return NoContent();
        }
        // DELETE /api/auctions/{auctionId}/paintings/{paintingId}/bids/{bidId}
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpDelete("{bidId:int}")]
        public async Task<ActionResult> DeleteScoped(int auctionId, int paintingId, int bidId)
        {
            // Load auction with paintings
            var auction = await _db.Auctions
                .Include(a => a.Paintings)
                .FirstOrDefaultAsync(a => a.Id == auctionId);
            if (auction is null) return NotFound("Auction not found.");

            // Painting must belong to the auction
            if (!auction.Paintings.Any(p => p.Id == paintingId))
                return BadRequest("Painting is not part of this auction.");

            // Find the bid
            var bid = await _db.Bids.FirstOrDefaultAsync(b =>
                b.Id == bidId && b.AuctionId == auctionId && b.PaintingId == paintingId);
            if (bid is null) return NotFound("Bid not found.");

            // If auction ended, keep history immutable
            if (auction.Status == AuctionStatus.Ended)
                return BadRequest("Cannot remove bids from an ended auction.");

            var isAdmin = User.IsInRole(Roles.Admin);

            if (!isAdmin)
            {
                // Must be the owner
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
                if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                    return Unauthorized("Invalid user.");

                if (bid.UserId != userId)
                    return Forbid();

                // (optional) block removing the current highest while Live
                // var highestId = await _db.Bids
                //    .Where(b => b.AuctionId == auctionId && b.PaintingId == paintingId)
                //    .OrderByDescending(b => (double)b.Amount) // REAL cast if using SQLite
                //    .Select(b => b.Id)
                //    .FirstOrDefaultAsync();
                // if (auction.Status == AuctionStatus.Live && highestId == bid.Id)
                //     return BadRequest("Cannot remove the current highest bid while the auction is live.");
            }

            _db.Bids.Remove(bid);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
