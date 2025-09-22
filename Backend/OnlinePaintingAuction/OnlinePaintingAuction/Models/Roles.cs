namespace OnlinePaintingAuction.Api.Models
{
    public static class Roles
    {
        public const string User = "User";
        public const string Admin = "Admin";
        public const string Bidder = "Bidder";

        public static bool IsValid(string role) =>
            role == User || role == Admin || role == Bidder;
    }
}
