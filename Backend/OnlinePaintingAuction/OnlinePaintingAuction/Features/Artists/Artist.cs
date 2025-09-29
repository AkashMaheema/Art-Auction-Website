using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlinePaintingAuction.Api.Features.Artists
{
    public class Artist
    {
        public int Id { get; set; }

        [Required, MaxLength(180)]
        public string Name { get; set; } = default!;

        [MaxLength(4000)]
        public string? Bio { get; set; }

        [MaxLength(500)]
        public string? Image { get; set; }

        [MaxLength(120)]
        public string? Nationality { get; set; }

        public int? BirthYear { get; set; }

        [MaxLength(160)]
        public string? Style { get; set; }

        public bool Verified { get; set; } = false;
        public bool Trending { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalSales { get; set; } = 0m;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AveragePrice { get; set; } = 0m;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAtUtc { get; set; }
    }
}
