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



        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            /// Create tables
            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<Areas>().ToTable("Areas");
            builder.Entity<Stables>().ToTable("Stables");
            builder.Entity<Suppliers>().ToTable("Suppliers");
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

    }
}