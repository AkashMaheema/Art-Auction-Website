using Microsoft.EntityFrameworkCore;
using OnlinePaintingAuction.Api.Features.Artists;
using OnlinePaintingAuction.Api.Features.Auctions;  
using OnlinePaintingAuction.Api.Features.Bids;
using OnlinePaintingAuction.Api.Features.Paintings;
using OnlinePaintingAuction.Api.Models;

namespace OnlinePaintingAuction.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Painting> Paintings => Set<Painting>();
        public DbSet<Auction> Auctions => Set<Auction>();
        public DbSet<Bid> Bids => Set<Bid>();
        public DbSet<Artist> Artists => Set<Artist>();
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
            
            // Artists
            modelBuilder.Entity<Artist>()
                .HasIndex(a => a.Name);

            modelBuilder.Entity<Artist>()
                .Property(a => a.TotalSales)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Artist>()
                .Property(a => a.AveragePrice)
                .HasPrecision(18, 2);

            // Paintings
            modelBuilder.Entity<Painting>()
                .HasIndex(p => p.Title);            

            modelBuilder.Entity<Painting>()
                .Property(p => p.MinBid)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Painting>()
                .Property(p => p.EstimateLow)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Painting>()
                .Property(p => p.EstimateHigh)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Painting>()
                .HasOne(p => p.ArtistRef)
                .WithMany()                     // or .WithMany(a => a.Paintings) if you add a collection on Artist
                .HasForeignKey(p => p.ArtistId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Auctions
            modelBuilder.Entity<Auction>()
                .Property(a => a.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Auction>()
                .Property(a => a.Description)
                .HasMaxLength(2000);

            // Many-to-many: Auction <-> Paintings
            // Unidirectional (Painting doesn't declare a navigation back to Auction)
            modelBuilder.Entity<Auction>()
                .HasMany(a => a.Paintings)
                .WithMany()
                .UsingEntity(j => j.ToTable("AuctionPaintings"));

            // Bids
            modelBuilder.Entity<Bid>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bid>()
                .HasOne(b => b.Auction)
                .WithMany()                  // (optional) add ICollection<Bid> on Auction if you want inverse
                .HasForeignKey(b => b.AuctionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Bid>()
                .HasOne(b => b.Painting)
                .WithMany()                  // (optional) add ICollection<Bid> on Painting if you want inverse
                .HasForeignKey(b => b.PaintingId)
                .OnDelete(DeleteBehavior.Cascade);

            // Helpful indexes for queries by scope & price
            modelBuilder.Entity<Bid>()
                .HasIndex(b => new { b.AuctionId, b.PaintingId });

            modelBuilder.Entity<Bid>()
                .HasIndex(b => new { b.AuctionId, b.PaintingId, b.Amount });


            base.OnModelCreating(modelBuilder);

            if (Database.IsSqlite())
            {
                // Map decimal amounts to REAL for SQLite
                modelBuilder.Entity<Painting>().Property(p => p.MinBid).HasConversion<double>();
                modelBuilder.Entity<Painting>().Property(p => p.EstimateLow).HasConversion<double>();
                modelBuilder.Entity<Painting>().Property(p => p.EstimateHigh).HasConversion<double>();

                modelBuilder.Entity<Bid>().Property(b => b.Amount).HasConversion<double>();

                modelBuilder.Entity<Artist>().Property(a => a.TotalSales).HasConversion<double>();
                modelBuilder.Entity<Artist>().Property(a => a.AveragePrice).HasConversion<double>();
            }
        }
    }
}
