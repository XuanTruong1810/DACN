using Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Context
{
    public class DataBaseContext(DbContextOptions<DataBaseContext> options) : IdentityDbContext<ApplicationUser>(options)
    {
        public DbSet<ApplicationUser> Users { get; set; }

        public DbSet<Areas> Areas { get; set; }
        public DbSet<Stables> Stables { get; set; }
        public DbSet<Suppliers> Suppliers { get; set; }

        public DbSet<PigIntakes> PigIntakes { get; set; }

        public DbSet<Pigs> Pigs { get; set; }
        public DbSet<Feeds> Feeds { get; set; }
        public DbSet<FeedTypes> FeedTypes { get; set; }
        public DbSet<FeedInTakes> FeedInTakes { get; set; }
        public DbSet<FeedInTakeDetails> FeedInTakeDetails { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            /// Key
            builder.Entity<FeedInTakeDetails>()
                .HasKey(d => new { d.FeedInTakeId, d.FeedId });
            /// Create tables
            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<Areas>().ToTable("Areas");
            builder.Entity<Stables>().ToTable("Stables");
            builder.Entity<Suppliers>().ToTable("Suppliers");
            builder.Entity<PigIntakes>().ToTable("PigIntakes");
            builder.Entity<Pigs>().ToTable("Pigs");
            builder.Entity<Feeds>().ToTable("Feeds");
            builder.Entity<FeedTypes>().ToTable("FeedTypes");
            builder.Entity<FeedInTakes>().ToTable("FeedInTakes");
            builder.Entity<FeedInTakeDetails>().ToTable("FeedInTakeDetails");
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

    }
}