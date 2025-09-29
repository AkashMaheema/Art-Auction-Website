using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.Models;                 // Roles
using OnlinePaintingAuction.Api.Features.Artists;       // Artist
// ReSharper disable All

namespace OnlinePaintingAuction.Api.Features.Paintings
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaintingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PaintingsController(AppDbContext db) => _db = db;

        // ===== VIEW (Admin + Bidder) =====
        // Filters: q (title/artist), category, artistId, featured
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaintingSummaryDto>>> GetAll(
            [FromQuery] string? q,
            [FromQuery] string? category,
            [FromQuery] int? artistId,
            [FromQuery] bool? featured)
        {
            var query = _db.Paintings
                .AsNoTracking()
                .Include(p => p.ArtistRef)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(term) ||
                    p.ArtistRef.Name.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "all")
                query = query.Where(p => p.Category == category);

            if (artistId.HasValue)
                query = query.Where(p => p.ArtistId == artistId.Value);

            if (featured.HasValue)
                query = query.Where(p => p.Featured == featured.Value);

            var list = await query
                .OrderByDescending(p => p.Featured)
                .ThenBy(p => p.Title)
                .Select(p => new PaintingSummaryDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    ArtistId = p.ArtistId,
                    ArtistName = p.ArtistRef.Name,
                    ImageUrl = p.ImageUrl,
                    Category = p.Category,
                    MinBid = p.MinBid,
                    Featured = p.Featured
                })
                .ToListAsync();

            return Ok(list);
        }

        // ===== GET BY ID (Admin + Bidder) =====
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PaintingDto>> Get(int id)
        {
            var p = await _db.Paintings
                .AsNoTracking()
                .Include(x => x.ArtistRef)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (p is null) return NotFound();

            return Ok(new PaintingDto
            {
                Id = p.Id,
                Title = p.Title,
                ArtistId = p.ArtistId,
                ArtistName = p.ArtistRef.Name,
                Category = p.Category,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                MinBid = p.MinBid,
                Featured = p.Featured,
                Year = p.Year,
                Medium = p.Medium,
                Dimensions = p.Dimensions,
                Condition = p.Condition,
                EstimateLow = p.EstimateLow,
                EstimateHigh = p.EstimateHigh
            });
        }

        // ===== CREATE (Admin) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<PaintingDto>> Create([FromBody] CreatePaintingRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title))
                return BadRequest("Title is required.");

            // Validate artist
            var artist = await _db.Artists
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == req.ArtistId);
            if (artist is null)
                return BadRequest("Artist not found.");

            // Validate estimate range
            if (req.EstimateLow.HasValue && req.EstimateHigh.HasValue &&
                req.EstimateLow.Value > req.EstimateHigh.Value)
                return BadRequest("Estimate low cannot be greater than estimate high.");

            var p = new Painting
            {
                Title = req.Title.Trim(),
                ArtistId = req.ArtistId,
                Artist = artist.Name, // keep legacy text in sync (can remove once UI drops it)
                Category = string.IsNullOrWhiteSpace(req.Category) ? "General" : req.Category.Trim(),
                Description = req.Description?.Trim(),
                ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim(),
                MinBid = req.MinBid,
                Featured = req.Featured,
                Year = req.Year,
                Medium = req.Medium?.Trim(),
                Dimensions = req.Dimensions?.Trim(),
                Condition = req.Condition?.Trim(),
                EstimateLow = req.EstimateLow,
                EstimateHigh = req.EstimateHigh
            };

            _db.Paintings.Add(p);
            await _db.SaveChangesAsync();

            var dto = new PaintingDto
            {
                Id = p.Id,
                Title = p.Title,
                ArtistId = p.ArtistId,
                ArtistName = artist.Name,
                Category = p.Category,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                MinBid = p.MinBid,
                Featured = p.Featured,
                Year = p.Year,
                Medium = p.Medium,
                Dimensions = p.Dimensions,
                Condition = p.Condition,
                EstimateLow = p.EstimateLow,
                EstimateHigh = p.EstimateHigh
            };

            return CreatedAtAction(nameof(Get), new { id = p.Id }, dto);
        }

        // ===== UPDATE (Admin) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdatePaintingRequest req)
        {
            var p = await _db.Paintings.FirstOrDefaultAsync(x => x.Id == id);
            if (p is null) return NotFound();

            if (req.EstimateLow.HasValue && req.EstimateHigh.HasValue &&
                req.EstimateLow.Value > req.EstimateHigh.Value)
                return BadRequest("Estimate low cannot be greater than estimate high.");

            if (req.Title is not null) p.Title = req.Title.Trim();
            if (req.Category is not null) p.Category = req.Category.Trim();
            if (req.Description is not null) p.Description = req.Description.Trim();
            if (req.ImageUrl is not null) p.ImageUrl = string.IsNullOrWhiteSpace(req.ImageUrl) ? null : req.ImageUrl.Trim();
            if (req.MinBid.HasValue) p.MinBid = req.MinBid.Value;
            if (req.Featured.HasValue) p.Featured = req.Featured.Value;

            if (req.Year.HasValue) p.Year = req.Year.Value;
            if (req.Medium is not null) p.Medium = req.Medium.Trim();
            if (req.Dimensions is not null) p.Dimensions = req.Dimensions.Trim();
            if (req.Condition is not null) p.Condition = req.Condition.Trim();
            if (req.EstimateLow.HasValue) p.EstimateLow = req.EstimateLow.Value;
            if (req.EstimateHigh.HasValue) p.EstimateHigh = req.EstimateHigh.Value;

            // ✅ allow switching artist
            if (req.ArtistId.HasValue)
            {
                var artist = await _db.Artists.AsNoTracking().FirstOrDefaultAsync(a => a.Id == req.ArtistId.Value);
                if (artist is null) return BadRequest("Artist not found.");

                p.ArtistId = req.ArtistId.Value;
                p.Artist = artist.Name; // keep legacy text in sync (optional)
            }

            p.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ===== DELETE (Admin) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var p = await _db.Paintings.FirstOrDefaultAsync(x => x.Id == id);
            if (p is null) return NotFound();

            _db.Paintings.Remove(p);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
