using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlinePaintingAuction.Data;      // AppDbContext
using OnlinePaintingAuction.Services;  // TokenService, JwtOptions
using OnlinePaintingAuction.Models;    // User, Roles
using BCrypt.Net;      // alias for BCrypt

var builder = WebApplication.CreateBuilder(args);

// CORS: adjust to your React origin(s)
const string CorsPolicy = "ReactCors";
builder.Services.AddCors(opts =>
{
    opts.AddPolicy(CorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// EF Core (SQLite)
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// Bind Jwt options for TokenService (IOptions<JwtOptions>)
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

// JWT auth
var jwt = builder.Configuration.GetSection("Jwt");
var keyStr = jwt["Key"];
if (string.IsNullOrWhiteSpace(keyStr))
    throw new InvalidOperationException("Missing Jwt:Key in configuration (appsettings/UserSecrets).");

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddControllers();

// (optional) Swagger for local testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ---- Apply migrations & seed an initial admin (AFTER build, BEFORE Run) ----
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var seedEmail = app.Configuration["AdminSeed:Email"]?.Trim()?.ToLowerInvariant();
    var seedPass = app.Configuration["AdminSeed:Password"];
    var seedName = app.Configuration["AdminSeed:DisplayName"] ?? "Admin";

    if (!string.IsNullOrWhiteSpace(seedEmail) && !string.IsNullOrWhiteSpace(seedPass))
    {
        var exists = await db.Users.AnyAsync(u => u.Email == seedEmail);
        if (!exists)
        {
            db.Users.Add(new User
            {
                Email = seedEmail,
                Name = seedName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPass, workFactor: 12),
                Role = Roles.Admin
            });
            await db.SaveChangesAsync();
            Console.WriteLine($"Seeded admin: {seedEmail}");
        }
    }
}
// ---------------------------------------------------------------------------

app.Run();
