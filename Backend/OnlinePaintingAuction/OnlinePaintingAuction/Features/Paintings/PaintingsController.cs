using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.Models; // Roles
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
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaintingDto>>> GetAll(
            [FromQuery] string? q,
            [FromQuery] string? category)
        {
            var query = _db.Paintings.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(term) ||
                                         p.Artist.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "all")
                query = query.Where(p => p.Category == category);

            var list = await query
                .OrderByDescending(p => p.Featured)
                .ThenBy(p => p.Title)
                .Select(p => new PaintingDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Artist = p.Artist,
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
                    EstimateHigh = p.EstimateHigh,
                    CreatedAtUtc = p.CreatedAtUtc,
                    UpdatedAtUtc = p.UpdatedAtUtc
                })

                .ToListAsync();

            return Ok(list);
        }

        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PaintingDto>> Get(int id)
        {
            var p = await _db.Paintings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (p is null) return NotFound();

            return Ok(new PaintingDto
            {
                Id = p.Id,
                Title = p.Title,
                Artist = p.Artist,
                Category = p.Category,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                MinBid = p.MinBid,
                Featured = p.Featured,
                CreatedAtUtc = p.CreatedAtUtc,
                UpdatedAtUtc = p.UpdatedAtUtc
            });
        }

        // ===== ADMIN (Create / Update / Delete) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<PaintingDto>> Create([FromBody] CreatePaintingRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Artist))
                return BadRequest("Title and Artist are required.");

            // simple estimate validation
            if (req.EstimateLow.HasValue && req.EstimateHigh.HasValue &&
                req.EstimateLow.Value > req.EstimateHigh.Value)
                return BadRequest("Estimate low cannot be greater than estimate high.");

            var p = new Painting
            {
                Title = req.Title.Trim(),
                Artist = req.Artist.Trim(),
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
                Artist = p.Artist,
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
                EstimateHigh = p.EstimateHigh,
                CreatedAtUtc = p.CreatedAtUtc,
                UpdatedAtUtc = p.UpdatedAtUtc
            };

            return CreatedAtAction(nameof(Get), new { id = p.Id }, dto);
        }


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
            if (req.Artist is not null) p.Artist = req.Artist.Trim();
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

            p.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }


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
