using System.ComponentModel.DataAnnotations;

namespace OnlinePaintingAuction.Api.Features.Paintings
{
    public class Painting
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = default!;

        [Required, MaxLength(150)]
        public string Artist { get; set; } = default!;

        [MaxLength(100)]
        public string Category { get; set; } = "General";

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(400)]
        public string? ImageUrl { get; set; }

        [Range(0, double.MaxValue)]
        public decimal MinBid { get; set; }

        public bool Featured { get; set; } = false;

        // NEW FIELDS
        [Range(1000, 3000)]
        public int? Year { get; set; }                     // e.g., 2023

        [MaxLength(200)]
        public string? Medium { get; set; }                // "Oil on canvas"

        [MaxLength(200)]
        public string? Dimensions { get; set; }            // "36 x 48 inches"

        [MaxLength(100)]
        public string? Condition { get; set; }             // "Excellent"

        [Range(0, double.MaxValue)]
        public decimal? EstimateLow { get; set; }          // 12000

        [Range(0, double.MaxValue)]
        public decimal? EstimateHigh { get; set; }         // 18000

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAtUtc { get; set; }
    }
}
