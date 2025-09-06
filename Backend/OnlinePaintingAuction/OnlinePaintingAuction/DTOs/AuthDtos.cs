namespace OnlinePaintingAuction.DTOs
{
    public class RegisterRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Role { get; set; } // optional (default Bidder)
    }

    public class LoginRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Role { get; set; } = default!;
        public long ExpiresAtUnix { get; set; }
    }
}
