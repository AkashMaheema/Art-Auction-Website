using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.Features.Paintings;
using OnlinePaintingAuction.Api.Models;

namespace OnlinePaintingAuction.Api.Features.Auctions
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AuctionsController(AppDbContext db) => _db = db;

        // ===== VIEW (Admin + Bidder) =====
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuctionSummaryDto>>> GetAll(
            [FromQuery] string? q,
            [FromQuery] string? status)
        {
            var query = _db.Auctions
                .AsNoTracking()
                .Include(a => a.Paintings)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(a =>
                    a.Title.ToLower().Contains(term) ||
                    (a.Description != null && a.Description.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<AuctionStatus>(status, true, out var st))
            {
                query = query.Where(a => a.Status == st);
            }

            var list = await query
                .OrderBy(a => a.StartsAtUtc)
                .Select(a => new AuctionSummaryDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    StartsAtUtc = a.StartsAtUtc,
                    EndsAtUtc = a.EndsAtUtc,
                    Status = a.Status.ToString(),
                    PaintingIds = a.Paintings.Select(p => p.Id).ToList()
                })
                .ToListAsync();

            return Ok(list);
        }

        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AuctionDto>> Get(int id)
        {
            var a = await _db.Auctions
                .AsNoTracking()
                .Include(x => x.Paintings)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (a is null) return NotFound();

            return Ok(new AuctionDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                StartsAtUtc = a.StartsAtUtc,
                EndsAtUtc = a.EndsAtUtc,
                Status = a.Status.ToString(),
                PaintingIds = a.Paintings.Select(p => p.Id).ToList(),
                CreatedAtUtc = a.CreatedAtUtc,
                UpdatedAtUtc = a.UpdatedAtUtc
            });
        }

        // ===== ADMIN (Create/Update/Delete) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<AuctionDto>> Create([FromBody] CreateAuctionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title))
                return BadRequest("Title is required.");
            if (req.StartsAtUtc >= req.EndsAtUtc)
                return BadRequest("StartsAtUtc must be earlier than EndsAtUtc.");

            // Load & validate paintings
            var paintingIds = (req.PaintingIds ?? new()).Distinct().ToList();
            var paintings = await _db.Paintings
                .Where(p => paintingIds.Contains(p.Id))
                .ToListAsync();

            if (paintings.Count != paintingIds.Count)
                return BadRequest("One or more paintingIds are invalid.");

            var auction = new Auction
            {
                Title = req.Title.Trim(),
                Description = req.Description?.Trim(),
                StartsAtUtc = DateTime.SpecifyKind(req.StartsAtUtc, DateTimeKind.Utc),
                EndsAtUtc = DateTime.SpecifyKind(req.EndsAtUtc, DateTimeKind.Utc),
                Status = AuctionStatus.Scheduled,
                Paintings = paintings
            };

            _db.Auctions.Add(auction);
            await _db.SaveChangesAsync();

            var dto = new AuctionDto
            {
                Id = auction.Id,
                Title = auction.Title,
                Description = auction.Description,
                StartsAtUtc = auction.StartsAtUtc,
                EndsAtUtc = auction.EndsAtUtc,
                Status = auction.Status.ToString(),
                PaintingIds = auction.Paintings.Select(p => p.Id).ToList(),
                CreatedAtUtc = auction.CreatedAtUtc,
                UpdatedAtUtc = auction.UpdatedAtUtc
            };

            return CreatedAtAction(nameof(Get), new { id = auction.Id }, dto);
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateAuctionRequest req)
        {
            var a = await _db.Auctions
                .Include(x => x.Paintings)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (a is null) return NotFound();

            if (req.StartsAtUtc.HasValue && req.EndsAtUtc.HasValue &&
                req.StartsAtUtc.Value >= req.EndsAtUtc.Value)
                return BadRequest("StartsAtUtc must be earlier than EndsAtUtc.");

            if (req.Title is not null) a.Title = req.Title.Trim();
            if (req.Description is not null) a.Description = req.Description.Trim();
            if (req.StartsAtUtc.HasValue) a.StartsAtUtc = DateTime.SpecifyKind(req.StartsAtUtc.Value, DateTimeKind.Utc);
            if (req.EndsAtUtc.HasValue) a.EndsAtUtc = DateTime.SpecifyKind(req.EndsAtUtc.Value, DateTimeKind.Utc);

            if (!string.IsNullOrWhiteSpace(req.Status) &&
                Enum.TryParse<AuctionStatus>(req.Status, true, out var newStatus))
            {
                a.Status = newStatus;
            }

            // Replace painting set if provided
            if (req.PaintingIds is not null)
            {
                var ids = req.PaintingIds.Distinct().ToList();
                var paintings = await _db.Paintings.Where(p => ids.Contains(p.Id)).ToListAsync();
                if (paintings.Count != ids.Count)
                    return BadRequest("One or more paintingIds are invalid.");

                // Clear and reattach
                a.Paintings.Clear();
                foreach (var p in paintings) a.Paintings.Add(p);
            }

            a.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var a = await _db.Auctions.FirstOrDefaultAsync(x => x.Id == id);
            if (a is null) return NotFound();

            _db.Auctions.Remove(a);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
