namespace OnlinePaintingAuction.Api.Features.Artists
{
    public class ArtistSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Bio { get; set; }
        public string? Image { get; set; }
        public string? Nationality { get; set; }
        public int? BirthYear { get; set; }
        public string? Style { get; set; }
        public bool Verified { get; set; }
        public bool Trending { get; set; }
        public decimal TotalSales { get; set; }
        public decimal AveragePrice { get; set; }
    }

    public class ArtistDto : ArtistSummaryDto
    {
        public string? Bio { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public class CreateArtistRequest
    {
        public string Name { get; set; } = default!;
        public string? Bio { get; set; }
        public string? Image { get; set; }
        public string? Nationality { get; set; }
        public int? BirthYear { get; set; }
        public string? Style { get; set; }
        public bool? Verified { get; set; }
        public bool? Trending { get; set; }
        public decimal? TotalSales { get; set; }
        public decimal? AveragePrice { get; set; }
    }

    public class UpdateArtistRequest
    {
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public string? Image { get; set; }
        public string? Nationality { get; set; }
        public int? BirthYear { get; set; }
        public string? Style { get; set; }
        public bool? Verified { get; set; }
        public bool? Trending { get; set; }
        public decimal? TotalSales { get; set; }
        public decimal? AveragePrice { get; set; }
    }
}
