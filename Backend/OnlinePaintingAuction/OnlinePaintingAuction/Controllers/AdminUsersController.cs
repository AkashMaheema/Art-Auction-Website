using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.DTOs;
using OnlinePaintingAuction.Api.Models;

namespace OnlinePaintingAuction.Api.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AdminUsersController(AppDbContext db) => _db = db;

        // Minimal list (you can add pagination later)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> List()
        {
            var users = await _db.Users
                .OrderBy(u => u.CreatedAtUtc)
                .Select(u => new { u.Id, u.Email, u.Name, u.Role, u.CreatedAtUtc })
                .ToListAsync();

            return Ok(users);
        }

        // Promote/demote user role (Admin <-> User)
        [HttpPut("{id:guid}/role")]
        public async Task<ActionResult> SetRole(Guid id, [FromBody] SetRoleRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Role))
                return BadRequest("Role is required.");

            var role = req.Role.Trim();
            if (!Roles.IsValid(role))
                return BadRequest("Invalid role. Allowed: 'User', 'Admin'.");

            var target = await _db.Users.FindAsync(id);
            if (target is null) return NotFound("User not found.");

            // Prevent locking yourself out: if this is the ONLY admin, don't demote self.
            if (target.Role == Roles.Admin && role == Roles.User)
            {
                var admins = await _db.Users.CountAsync(u => u.Role == Roles.Admin);
                var isSelf = User?.Identity?.Name == target.Name ||
                             User?.Claims?.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value == target.Id.ToString();

                if (admins <= 1 && isSelf)
                    return BadRequest("Cannot demote the only admin. Create another admin first.");
            }

            target.Role = role;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
