namespace OnlinePaintingAuction.Models
{
    public static class Roles
    {
        public const string User = "User";
        public const string Admin = "Admin";

        public static bool IsValid(string role) =>
            role == User || role == Admin;
    }
}
