namespace OnlinePaintingAuction.Api.Features.Paintings
{
    public class PaintingDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Artist { get; set; } = default!;
        public string Category { get; set; } = default!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal MinBid { get; set; }
        public bool Featured { get; set; }

        // NEW
        public int? Year { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public decimal? EstimateLow { get; set; }
        public decimal? EstimateHigh { get; set; }

        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public class CreatePaintingRequest
    {
        public string Title { get; set; } = default!;
        public string Artist { get; set; } = default!;
        public string Category { get; set; } = "General";
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal MinBid { get; set; }
        public bool Featured { get; set; } = false;

        // NEW (optional)
        public int? Year { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public decimal? EstimateLow { get; set; }
        public decimal? EstimateHigh { get; set; }
    }

    public class UpdatePaintingRequest
    {
        public string? Title { get; set; }
        public string? Artist { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? MinBid { get; set; }
        public bool? Featured { get; set; }

        // NEW (all optional)
        public int? Year { get; set; }
        public string? Medium { get; set; }
        public string? Dimensions { get; set; }
        public string? Condition { get; set; }
        public decimal? EstimateLow { get; set; }
        public decimal? EstimateHigh { get; set; }
    }
}
