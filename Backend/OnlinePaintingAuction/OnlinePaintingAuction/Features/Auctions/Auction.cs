using System.ComponentModel.DataAnnotations;
using OnlinePaintingAuction.Api.Features.Paintings;

namespace OnlinePaintingAuction.Api.Features.Auctions
{
    public enum AuctionStatus
    {
        Draft = 0,
        Scheduled = 1,
        Live = 2,
        Paused = 3,
        Ended = 4,
        Cancelled = 5
    }

    public class Auction
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = default!;

        [MaxLength(2000)]
        public string? Description { get; set; }

        public DateTime StartsAtUtc { get; set; }
        public DateTime EndsAtUtc { get; set; }

        public AuctionStatus Status { get; set; } = AuctionStatus.Draft;

        // Many-to-many (unidirectional) to Paintings
        public ICollection<Painting> Paintings { get; set; } = new List<Painting>();

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAtUtc { get; set; }
    }
}
