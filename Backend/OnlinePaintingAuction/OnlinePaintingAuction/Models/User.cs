using System;

namespace OnlinePaintingAuction.Api.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
        public string Role { get; set; } = Roles.User;   // default user
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
