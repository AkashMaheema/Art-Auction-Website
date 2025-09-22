using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Features.Paintings;
using OnlinePaintingAuction.Api.Models;


namespace OnlinePaintingAuction.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Painting> Paintings => Set<Painting>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Users
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .IsRequired();

            modelBuilder.Entity<User>()
                .Property(u => u.Name)
                .IsRequired();

            // Paintings
            modelBuilder.Entity<Painting>()
                .HasIndex(p => p.Title);
            modelBuilder.Entity<Painting>()
                .HasIndex(p => p.Artist);
            modelBuilder.Entity<Painting>()
                .Property(p => p.MinBid)
                .HasPrecision(18, 2);
            modelBuilder.Entity<Painting>()
                .Property(p => p.EstimateLow)
                .HasPrecision(18, 2);
            modelBuilder.Entity<Painting>()
                .Property(p => p.EstimateHigh)
                .HasPrecision(18, 2);

            base.OnModelCreating(modelBuilder);
        }
    }
}
