using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Data;
using OnlinePaintingAuction.Api.DTOs;
using OnlinePaintingAuction.Api.Models;
using OnlinePaintingAuction.Api.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace OnlinePaintingAuction.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ITokenService _tokenService;

        public AuthController(AppDbContext db, ITokenService tokenService)
        {
            _db = db;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
        {
            // basic validation
            if (string.IsNullOrWhiteSpace(req.Email) ||
                string.IsNullOrWhiteSpace(req.Password) ||
                string.IsNullOrWhiteSpace(req.Name))
            {
                return BadRequest("Email, Password, and DisplayName are required.");
            }

            var normalizedEmail = req.Email.Trim().ToLowerInvariant();
            if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail))
            {
                return Conflict("Email already in use.");
            }

            // hash password
            var hash = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 12);

            var user = new User
            {
                Email = normalizedEmail,
                Name = req.Name.Trim(),
                PasswordHash = hash,
                Role = string.IsNullOrWhiteSpace(req.Role) ? "Bidder" : req.Role.Trim()
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var (token, expires) = _tokenService.CreateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                UserId = user.Id.ToString(),
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                ExpiresAtUnix = new DateTimeOffset(expires).ToUnixTimeSeconds()
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest("Email and Password are required.");
            }

            var normalizedEmail = req.Email.Trim().ToLowerInvariant();
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user is null)
            {
                return Unauthorized("Invalid credentials.");
            }

            var valid = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
            if (!valid)
            {
                return Unauthorized("Invalid credentials.");
            }

            var (token, expires) = _tokenService.CreateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                UserId = user.Id.ToString(),
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                ExpiresAtUnix = new DateTimeOffset(expires).ToUnixTimeSeconds()
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<object>> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var id))
                return Unauthorized();

            var user = await _db.Users.FindAsync(id);
            if (user is null) return Unauthorized();

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Name,
                user.Role,
                user.CreatedAtUtc
            });
        }
    }
}
