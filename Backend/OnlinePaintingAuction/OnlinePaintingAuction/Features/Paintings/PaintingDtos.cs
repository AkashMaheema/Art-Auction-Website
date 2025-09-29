namespace OnlinePaintingAuction.Api.Features.Paintings
{
    public class PaintingSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public int ArtistId { get; set; }
        public string ArtistName { get; set; } = default!;  // convenience for UI
        public string? ImageUrl { get; set; }
        public string? Category { get; set; }
        public decimal MinBid { get; set; }
        public bool Featured { get; set; }
    }

    public class PaintingDto : PaintingSummaryDto
    {
        public string? Description { get; set; }
        public int? Year { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public decimal? EstimateLow { get; set; }
        public decimal? EstimateHigh { get; set; }
    }

    public class CreatePaintingRequest
    {
        public string Title { get; set; } = default!;
        public int ArtistId { get; set; }                   // ✅ required
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int? Year { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public decimal MinBid { get; set; }
        public decimal? EstimateLow { get; set; }
        public decimal? EstimateHigh { get; set; }
        public bool Featured { get; set; }
    }

    public class UpdatePaintingRequest
    {
        public string? Title { get; set; }
        public int? ArtistId { get; set; }                  // ✅ updatable
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int? Year { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public decimal? MinBid { get; set; }
        public decimal? EstimateLow { get; set; }
        public decimal? EstimateHigh { get; set; }
        public bool? Featured { get; set; }
    }
}
