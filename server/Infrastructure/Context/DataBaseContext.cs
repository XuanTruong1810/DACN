using Core.Entities;
using Microsoft.AspNetCore.Identity;
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

        public DbSet<MedicineSupplier> MedicineSuppliers { get; set; }
        public DbSet<RequestMedicine> RequestMedicines { get; set; }
        public DbSet<ImportMedicine> ImportMedicines { get; set; }
        public DbSet<ImportOrderDetail> ImportOrderDetails { get; set; }

        // public DbSet<HealthRecords> HealthRecords { get; set; }
        // public DbSet<HealthRecordDetails> HealthRecordDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Constraints
            builder.Entity<Pigs>()
                .HasIndex(u => u.PigId)
                .IsUnique();

            /// Key
            builder.Entity<FeedInTakeDetails>()
                .HasKey(d => new { d.FeedInTakeId, d.FeedId });

            builder.Entity<ImportOrderDetail>()
                .HasKey(d => new { d.ImportId, d.MedicineUnitId });

            builder.Entity<MedicineSupplier>()
                .HasKey(ms => new { ms.MedicineId, ms.SupplierId });

            /// Create tables
            builder.Entity<ApplicationUser>().ToTable("User");
            builder.Entity<IdentityRole>().ToTable("Role");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRole");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaim");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogin");
            builder.Entity<IdentityUserToken<string>>().ToTable("UserToken");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaim");

            builder.Entity<Areas>().ToTable("Areas");
            builder.Entity<Stables>().ToTable("Stables");
            builder.Entity<Suppliers>().ToTable("Suppliers");
            builder.Entity<PigIntakes>().ToTable("PigIntakes");
            builder.Entity<Pigs>().ToTable("Pigs");
            builder.Entity<Feeds>().ToTable("Feeds");
            builder.Entity<FeedTypes>().ToTable("FeedTypes");
            builder.Entity<FeedInTakes>().ToTable("FeedInTakes");
            builder.Entity<FeedInTakeDetails>().ToTable("FeedInTakeDetails");
            builder.Entity<MedicineSupplier>().ToTable("MedicineSuppliers");
            builder.Entity<RequestMedicine>().ToTable("RequestMedicines");
            builder.Entity<ImportMedicine>().ToTable("ImportMedicines");
            builder.Entity<ImportOrderDetail>().ToTable("ImportOrderDetails");
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

    }
}