﻿// <auto-generated />
using System;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Infrastructure.Migrations
{
    [DbContext(typeof(DataBaseContext))]
    partial class DataBaseContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Proxies:ChangeTracking", false)
                .HasAnnotation("Proxies:CheckEquality", false)
                .HasAnnotation("Proxies:LazyLoading", true)
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Core.Entities.ApplicationUser", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("User", (string)null);
                });

            modelBuilder.Entity("Core.Entities.Areas", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.ToTable("Areas", (string)null);
                });

            modelBuilder.Entity("Core.Entities.FeedInTakeDetails", b =>
                {
                    b.Property<string>("FeedInTakeId")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnOrder(0);

                    b.Property<string>("FeedId")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnOrder(1);

                    b.Property<decimal?>("AcceptedQuantity")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("ExpectedQuantity")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("ReceivedQuantity")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("RejectedQuantity")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("UnitPrice")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("FeedInTakeId", "FeedId");

                    b.HasIndex("FeedId");

                    b.ToTable("FeedInTakeDetails", (string)null);
                });

            modelBuilder.Entity("Core.Entities.FeedInTakes", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("ApprovedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("CreateBy")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeliveryDate")
                        .HasColumnType("datetimeoffset");

                    b.Property<decimal?>("Deposit")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTimeOffset?>("IsInStock")
                        .HasColumnType("datetimeoffset");

                    b.Property<decimal?>("RemainingAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("SuppliersId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<decimal?>("TotalPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.HasIndex("SuppliersId");

                    b.ToTable("FeedInTakes", (string)null);
                });

            modelBuilder.Entity("Core.Entities.FeedTypes", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("FeedTypeName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.ToTable("FeedTypes", (string)null);
                });

            modelBuilder.Entity("Core.Entities.Feeds", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("AreasId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("FeedName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("FeedPerPig")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("FeedQuantity")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("FeedTypeId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.HasIndex("AreasId");

                    b.HasIndex("FeedTypeId");

                    b.ToTable("Feeds", (string)null);
                });

            modelBuilder.Entity("Core.Entities.HealthRecordDetails", b =>
                {
                    b.Property<string>("HealthRecordId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("PigId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("CreateBy")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("HealthStatus")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MedVacId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Note")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<double>("Weight")
                        .HasColumnType("float");

                    b.HasKey("HealthRecordId", "PigId");

                    b.HasIndex("MedVacId");

                    b.HasIndex("PigId");

                    b.ToTable("HealthRecordDetails", (string)null);
                });

            modelBuilder.Entity("Core.Entities.HealthRecords", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset>("RecordDate")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.ToTable("HealthRecords", (string)null);
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccineIntakeDetails", b =>
                {
                    b.Property<string>("MedVacIntakeId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("MedVacId")
                        .HasColumnType("nvarchar(450)")
                        .HasColumnOrder(1);

                    b.Property<int?>("AcceptedQuantity")
                        .HasColumnType("int");

                    b.Property<int>("ExpectedQuantity")
                        .HasColumnType("int");

                    b.Property<int?>("ReceivedQuantity")
                        .HasColumnType("int");

                    b.Property<int?>("RejectedQuantity")
                        .HasColumnType("int");

                    b.Property<decimal>("UnitPrice")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("MedVacIntakeId", "MedVacId");

                    b.HasIndex("MedVacId");

                    b.ToTable("MedicationAndVaccineIntakeDetails", (string)null);
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccineIntakes", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("ApprovedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("CreateBy")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeliveryDate")
                        .HasColumnType("datetimeoffset");

                    b.Property<decimal?>("Deposit")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTimeOffset?>("IsInStock")
                        .HasColumnType("datetimeoffset");

                    b.Property<decimal?>("RemainingAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("SuppliersId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<decimal?>("TotalPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.HasIndex("SuppliersId");

                    b.ToTable("MedicationAndVaccineIntakes", (string)null);
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccines", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("CreateBy")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<int>("DaysUsableAfterImport")
                        .HasColumnType("int");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset>("ExpiryDate")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Manufacturer")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MedVacName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.ToTable("MedicationAndVaccines", (string)null);
                });

            modelBuilder.Entity("Core.Entities.PigIntakes", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int?>("AcceptedQuantity")
                        .HasColumnType("int");

                    b.Property<DateTimeOffset?>("ApprovedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("CreateBy")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeliveryDate")
                        .HasColumnType("datetimeoffset");

                    b.Property<decimal?>("Deposit")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("ExpectedQuantity")
                        .HasColumnType("int");

                    b.Property<int?>("ReceivedQuantity")
                        .HasColumnType("int");

                    b.Property<int?>("RejectedQuantity")
                        .HasColumnType("int");

                    b.Property<decimal?>("RemainingAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("SuppliersId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<decimal?>("TotalPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("UnitPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.HasIndex("SuppliersId");

                    b.ToTable("PigIntakes", (string)null);
                });

            modelBuilder.Entity("Core.Entities.Pigs", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("PigId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("StableId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.HasIndex("PigId")
                        .IsUnique();

                    b.HasIndex("StableId");

                    b.ToTable("Pigs", (string)null);
                });

            modelBuilder.Entity("Core.Entities.Stables", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("AreasId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("Capacity")
                        .HasColumnType("int");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<int>("CurrentOccupancy")
                        .HasColumnType("int");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.HasIndex("AreasId");

                    b.ToTable("Stables", (string)null);
                });

            modelBuilder.Entity("Core.Entities.Suppliers", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("CreatedTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<DateTimeOffset?>("DeleteTime")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Phone")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TypeSuppier")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTimeOffset?>("UpdatedTime")
                        .HasColumnType("datetimeoffset");

                    b.HasKey("Id");

                    b.ToTable("Suppliers", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("Role", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("RoleClaim", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("UserClaim", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("UserLogin", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("UserRole", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("UserToken", (string)null);
                });

            modelBuilder.Entity("Core.Entities.FeedInTakeDetails", b =>
                {
                    b.HasOne("Core.Entities.Feeds", "Feeds")
                        .WithMany()
                        .HasForeignKey("FeedId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Core.Entities.FeedInTakes", "FeedInTakes")
                        .WithMany("FeedInTakeDetails")
                        .HasForeignKey("FeedInTakeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("FeedInTakes");

                    b.Navigation("Feeds");
                });

            modelBuilder.Entity("Core.Entities.FeedInTakes", b =>
                {
                    b.HasOne("Core.Entities.Suppliers", "Suppliers")
                        .WithMany()
                        .HasForeignKey("SuppliersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Suppliers");
                });

            modelBuilder.Entity("Core.Entities.Feeds", b =>
                {
                    b.HasOne("Core.Entities.Areas", "Areas")
                        .WithMany("Feeds")
                        .HasForeignKey("AreasId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Core.Entities.FeedTypes", "FeedTypes")
                        .WithMany("Feeds")
                        .HasForeignKey("FeedTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Areas");

                    b.Navigation("FeedTypes");
                });

            modelBuilder.Entity("Core.Entities.HealthRecordDetails", b =>
                {
                    b.HasOne("Core.Entities.HealthRecords", "HealthRecords")
                        .WithMany("HealthRecordDetails")
                        .HasForeignKey("HealthRecordId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Core.Entities.MedicationAndVaccines", "MedicationAndVaccines")
                        .WithMany()
                        .HasForeignKey("MedVacId");

                    b.HasOne("Core.Entities.Pigs", "Pigs")
                        .WithMany("HealthRecordDetails")
                        .HasForeignKey("PigId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("HealthRecords");

                    b.Navigation("MedicationAndVaccines");

                    b.Navigation("Pigs");
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccineIntakeDetails", b =>
                {
                    b.HasOne("Core.Entities.MedicationAndVaccines", "MedicationAndVaccines")
                        .WithMany("MedicationAndVaccineIntakeDetails")
                        .HasForeignKey("MedVacId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Core.Entities.MedicationAndVaccineIntakes", "MedicationAndVaccineIntakes")
                        .WithMany("MedicationAndVaccineIntakeDetails")
                        .HasForeignKey("MedVacIntakeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("MedicationAndVaccineIntakes");

                    b.Navigation("MedicationAndVaccines");
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccineIntakes", b =>
                {
                    b.HasOne("Core.Entities.Suppliers", "Suppliers")
                        .WithMany()
                        .HasForeignKey("SuppliersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Suppliers");
                });

            modelBuilder.Entity("Core.Entities.PigIntakes", b =>
                {
                    b.HasOne("Core.Entities.Suppliers", "Suppliers")
                        .WithMany("PigIntakes")
                        .HasForeignKey("SuppliersId");

                    b.Navigation("Suppliers");
                });

            modelBuilder.Entity("Core.Entities.Pigs", b =>
                {
                    b.HasOne("Core.Entities.Stables", "Stables")
                        .WithMany("Pigs")
                        .HasForeignKey("StableId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Stables");
                });

            modelBuilder.Entity("Core.Entities.Stables", b =>
                {
                    b.HasOne("Core.Entities.Areas", "Areas")
                        .WithMany("Stables")
                        .HasForeignKey("AreasId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Areas");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Core.Entities.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Core.Entities.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Core.Entities.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Core.Entities.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Core.Entities.Areas", b =>
                {
                    b.Navigation("Feeds");

                    b.Navigation("Stables");
                });

            modelBuilder.Entity("Core.Entities.FeedInTakes", b =>
                {
                    b.Navigation("FeedInTakeDetails");
                });

            modelBuilder.Entity("Core.Entities.FeedTypes", b =>
                {
                    b.Navigation("Feeds");
                });

            modelBuilder.Entity("Core.Entities.HealthRecords", b =>
                {
                    b.Navigation("HealthRecordDetails");
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccineIntakes", b =>
                {
                    b.Navigation("MedicationAndVaccineIntakeDetails");
                });

            modelBuilder.Entity("Core.Entities.MedicationAndVaccines", b =>
                {
                    b.Navigation("MedicationAndVaccineIntakeDetails");
                });

            modelBuilder.Entity("Core.Entities.Pigs", b =>
                {
                    b.Navigation("HealthRecordDetails");
                });

            modelBuilder.Entity("Core.Entities.Stables", b =>
                {
                    b.Navigation("Pigs");
                });

            modelBuilder.Entity("Core.Entities.Suppliers", b =>
                {
                    b.Navigation("PigIntakes");
                });
#pragma warning restore 612, 618
        }
    }
}
