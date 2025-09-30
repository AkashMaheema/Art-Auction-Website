using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OnlinePaintingAuction.Api.Features.Artists;

namespace OnlinePaintingAuction.Api.Features.Paintings
{
    public class Painting
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = default!;

        [MaxLength(200)]
        public string Artist { get; set; } = string.Empty;

        public int ArtistId { get; set; }
        public Artist ArtistRef { get; set; } = default!;

        [MaxLength(80)]
        public string? Category { get; set; }

        [MaxLength(4000)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int? Year { get; set; }
        [MaxLength(120)]
        public string? Medium { get; set; }
        [MaxLength(120)]
        public string? Dimensions { get; set; }
        [MaxLength(120)]
        public string? Condition { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinBid { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EstimateLow { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EstimateHigh { get; set; }

        public bool Featured { get; set; }

 
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAtUtc { get; set; }
    }
}
