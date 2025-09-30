using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OnlinePaintingAuction.Api.Features.Auctions;
using OnlinePaintingAuction.Api.Features.Paintings;
using OnlinePaintingAuction.Api.Models;

namespace OnlinePaintingAuction.Api.Features.Bids
{
    public class Bid
    {
        public int Id { get; set; }

        // Scope to an auction + a painting within that auction
        [Required]
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = default!;

        [Required]
        public int PaintingId { get; set; }
        public Painting Painting { get; set; } = default!;

        [Required]
        public Guid UserId { get; set; }
        public User? User { get; set; }

        // Snapshot fields (helpful if user later changes profile)
        [MaxLength(200)]
        public string BidderName { get; set; } = default!;
        [MaxLength(250)]
        public string BidderEmail { get; set; } = default!;

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime PlacedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
