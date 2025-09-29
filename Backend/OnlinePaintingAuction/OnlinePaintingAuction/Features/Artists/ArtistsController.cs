using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.Models; // Roles

namespace OnlinePaintingAuction.Api.Features.Artists
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArtistsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ArtistsController(AppDbContext db) => _db = db;

        // ===== List (Admin + Bidder) =====
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArtistSummaryDto>>> List(
            [FromQuery] string? q,
            [FromQuery] string? style,
            [FromQuery] string? nationality,
            [FromQuery] bool? verified,
            [FromQuery] bool? trending)
        {
            var query = _db.Artists.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(a =>
                    a.Name.ToLower().Contains(term) ||
                    (a.Bio != null && a.Bio.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(style))
                query = query.Where(a => a.Style != null && a.Style == style);

            if (!string.IsNullOrWhiteSpace(nationality))
                query = query.Where(a => a.Nationality != null && a.Nationality == nationality);

            if (verified.HasValue)
                query = query.Where(a => a.Verified == verified.Value);

            if (trending.HasValue)
                query = query.Where(a => a.Trending == trending.Value);

            var items = await query
                .OrderByDescending(a => a.Trending)
                .ThenBy(a => a.Name)
                .Select(a => new ArtistSummaryDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Image = a.Image,
                    Nationality = a.Nationality,
                    BirthYear = a.BirthYear,
                    Style = a.Style,
                    Verified = a.Verified,
                    Trending = a.Trending,
                    TotalSales = a.TotalSales,
                    AveragePrice = a.AveragePrice
                })
                .ToListAsync();

            return Ok(items);
        }

        // ===== Get (Admin + Bidder) =====
        [Authorize(Roles = $"{Roles.Admin},{Roles.Bidder}")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ArtistDto>> Get(int id)
        {
            var a = await _db.Artists.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (a is null) return NotFound();

            return Ok(new ArtistDto
            {
                Id = a.Id,
                Name = a.Name,
                Bio = a.Bio,
                Image = a.Image,
                Nationality = a.Nationality,
                BirthYear = a.BirthYear,
                Style = a.Style,
                Verified = a.Verified,
                Trending = a.Trending,
                TotalSales = a.TotalSales,
                AveragePrice = a.AveragePrice,
                CreatedAtUtc = a.CreatedAtUtc,
                UpdatedAtUtc = a.UpdatedAtUtc
            });
        }

        // ===== Create (Admin) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<ActionResult<ArtistDto>> Create([FromBody] CreateArtistRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Name))
                return BadRequest("Name is required.");

            var artist = new Artist
            {
                Name = req.Name.Trim(),
                Bio = req.Bio?.Trim(),
                Image = req.Image?.Trim(),
                Nationality = req.Nationality?.Trim(),
                BirthYear = req.BirthYear,
                Style = req.Style?.Trim(),
                Verified = req.Verified ?? false,
                Trending = req.Trending ?? false,
                TotalSales = req.TotalSales ?? 0m,
                AveragePrice = req.AveragePrice ?? 0m
            };

            _db.Artists.Add(artist);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = artist.Id }, new ArtistDto
            {
                Id = artist.Id,
                Name = artist.Name,
                Bio = artist.Bio,
                Image = artist.Image,
                Nationality = artist.Nationality,
                BirthYear = artist.BirthYear,
                Style = artist.Style,
                Verified = artist.Verified,
                Trending = artist.Trending,
                TotalSales = artist.TotalSales,
                AveragePrice = artist.AveragePrice,
                CreatedAtUtc = artist.CreatedAtUtc,
                UpdatedAtUtc = artist.UpdatedAtUtc
            });
        }

        // ===== Update (Admin) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateArtistRequest req)
        {
            var a = await _db.Artists.FirstOrDefaultAsync(x => x.Id == id);
            if (a is null) return NotFound();

            if (req.Name is not null) a.Name = req.Name.Trim();
            if (req.Bio is not null) a.Bio = req.Bio.Trim();
            if (req.Image is not null) a.Image = req.Image.Trim();
            if (req.Nationality is not null) a.Nationality = req.Nationality.Trim();
            if (req.BirthYear.HasValue) a.BirthYear = req.BirthYear;
            if (req.Style is not null) a.Style = req.Style.Trim();
            if (req.Verified.HasValue) a.Verified = req.Verified.Value;
            if (req.Trending.HasValue) a.Trending = req.Trending.Value;
            if (req.TotalSales.HasValue) a.TotalSales = req.TotalSales.Value;
            if (req.AveragePrice.HasValue) a.AveragePrice = req.AveragePrice.Value;

            a.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ===== Delete (Admin) =====
        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var a = await _db.Artists.FirstOrDefaultAsync(x => x.Id == id);
            if (a is null) return NotFound();

            _db.Artists.Remove(a);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
