namespace OnlinePaintingAuction.Api.Features.Bids
{
    public class BidDto
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public int PaintingId { get; set; }
        public decimal Amount { get; set; }
        public string BidderName { get; set; } = default!;
        public string BidderEmail { get; set; } = default!;
        public DateTime PlacedAtUtc { get; set; }
    }

    public class CreateBidRequest
    {
        public decimal Amount { get; set; }
    }
}
