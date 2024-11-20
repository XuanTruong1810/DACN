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
        public DbSet<MedicineImport> MedicineImports { get; set; }
        public DbSet<MedicineImportDetail> MedicineImportDetails { get; set; }
        public DbSet<RequestMedicineDetail> RequestMedicineDetails { get; set; }

        public DbSet<FoodTypes> FoodTypes { get; set; }
        public DbSet<Foods> Foods { get; set; }
        public DbSet<FoodSuppliers> FoodSuppliers { get; set; }

        public DbSet<FoodImportRequests> FoodImportRequests { get; set; }
        public DbSet<FoodImportRequestDetails> FoodImportRequestDetails { get; set; }

        public DbSet<FoodImports> FoodImports { get; set; }
        public DbSet<FoodImportDetails> FoodImportDetails { get; set; }

        public DbSet<Customers> Customers { get; set; }
        public DbSet<PigExportRequest> PigExportRequests { get; set; }
        public DbSet<PigExportRequestDetail> PigExportRequestDetails { get; set; }
        public DbSet<PigExport> PigExports { get; set; }
        public DbSet<PigExportDetail> PigExportDetails { get; set; }

        public DbSet<FoodExport> FoodExports { get; set; }
        public DbSet<FoodExportDetail> FoodExportDetails { get; set; }



        public DbSet<Medicines> Medicines { get; set; }
        public DbSet<VaccinationPlan> VaccinationPlans { get; set; }


        public DbSet<WeighingHistory> WeighingHistories { get; set; }
        public DbSet<WeighingDetail> WeighingDetails { get; set; }


        public DbSet<MovePigs> MovePigs { get; set; }
        public DbSet<MovePigDetails> MovePigDetails { get; set; }








        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Constraints

            /// Key
            /// 


            builder.Entity<FeedInTakeDetails>()
                .HasKey(d => new { d.FeedInTakeId, d.FeedId });

            builder.Entity<RequestMedicineDetail>()
                .HasKey(d => new { d.RequestMedicineId, d.MedicineId });

            builder.Entity<MedicineImportDetail>()
                .HasKey(d => new { d.MedicineImportId, d.MedicineId });

            builder.Entity<MedicineSupplier>()
                .HasKey(d => new { d.MedicineId, d.SupplierId });

            builder.Entity<PigExportRequestDetail>()
                .HasKey(d => new { d.PigExportRequestId, d.PigId });

            builder.Entity<PigExportDetail>()
                .HasKey(d => new { d.PigExportId, d.PigId });

            builder.Entity<FoodSuppliers>()
                .HasKey(d => new { d.FoodsId, d.SuppliersId });

            builder.Entity<FoodImportRequestDetails>()
                .HasKey(d => new { d.FoodImportRequestId, d.FoodId });

            builder.Entity<FoodImportDetails>()
                .HasKey(d => new { d.FoodImportId, d.FoodId });


            builder.Entity<VaccinationPlan>()
                .HasKey(d => new { d.PigId, d.MedicineId });


            builder.Entity<PigExportRequestDetail>()
                .HasKey(d => new { d.PigExportRequestId, d.PigId });


            builder.Entity<FoodExportDetail>()
                .HasKey(d => new { d.FoodExportId, d.FoodId });

            builder.Entity<WeighingDetail>()
                .HasKey(d => new { d.WeighingHistoryId, d.PigId });


            builder.Entity<MovePigDetails>()
                .HasKey(d => new { d.MovePigId, d.PigId });



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

            builder.Entity<RequestMedicine>().ToTable("RequestMedicine");
            builder.Entity<RequestMedicineDetail>().ToTable("RequestMedicineDetail");
            builder.Entity<MedicineImport>().ToTable("MedicineImport");
            builder.Entity<MedicineImportDetail>().ToTable("MedicineImportDetail");

            builder.Entity<FoodTypes>().ToTable("FoodTypes");
            builder.Entity<Foods>().ToTable("Foods");
            builder.Entity<FoodSuppliers>().ToTable("FoodSuppliers");

            builder.Entity<FoodImportRequests>().ToTable("FoodImportRequests");
            builder.Entity<FoodImportRequestDetails>().ToTable("FoodImportRequestDetails");

            builder.Entity<FoodImports>().ToTable("FoodImports");
            builder.Entity<FoodImportDetails>().ToTable("FoodImportDetails");


            builder.Entity<Customers>().ToTable("Customers");
            builder.Entity<PigExportRequest>().ToTable("PigExportRequest");
            builder.Entity<PigExportRequestDetail>().ToTable("PigExportRequestDetail");
            builder.Entity<PigExport>().ToTable("PigExport");
            builder.Entity<PigExportDetail>().ToTable("PigExportDetail");

            builder.Entity<Medicines>().ToTable("Medicines");
            builder.Entity<VaccinationPlan>().ToTable("VaccinationPlan");


            builder.Entity<FoodExport>().ToTable("FoodExport");
            builder.Entity<FoodExportDetail>().ToTable("FoodExportDetail");


            builder.Entity<WeighingHistory>().ToTable("WeighingHistory");
            builder.Entity<WeighingDetail>().ToTable("WeighingDetail");

            builder.Entity<MovePigDetails>().ToTable("MovePigDetails");
            builder.Entity<MovePigs>().ToTable("MovePig");
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

    }
}