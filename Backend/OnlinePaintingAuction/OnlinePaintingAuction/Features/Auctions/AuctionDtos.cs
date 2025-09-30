namespace OnlinePaintingAuction.Api.Features.Auctions
{
    public class AuctionSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public DateTime StartsAtUtc { get; set; }
        public DateTime EndsAtUtc { get; set; }
        public string Status { get; set; } = default!;
        public List<int> PaintingIds { get; set; } = new();
    }

    public class AuctionDto : AuctionSummaryDto
    {
        public string? Description { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public class CreateAuctionRequest
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime StartsAtUtc { get; set; }
        public DateTime EndsAtUtc { get; set; }
        public List<int> PaintingIds { get; set; } = new();
    }

    public class UpdateAuctionRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartsAtUtc { get; set; }
        public DateTime? EndsAtUtc { get; set; }
        public string? Status { get; set; }          // "Scheduled", "Live", etc.
        public List<int>? PaintingIds { get; set; }  // replace full set if provided
    }
}
