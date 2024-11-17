using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixExportReqGet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VaccinationSchedule");

            migrationBuilder.DropColumn(
                name: "CreatedTime",
                table: "PigExportRequestDetail");

            migrationBuilder.DropColumn(
                name: "DeleteTime",
                table: "PigExportRequestDetail");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "PigExportRequestDetail");

            migrationBuilder.DropColumn(
                name: "UpdatedTime",
                table: "PigExportRequestDetail");

            migrationBuilder.AddColumn<string>(
                name: "HealthStatus",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "Pigs",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HealthStatus",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Pigs");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedTime",
                table: "PigExportRequestDetail",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeleteTime",
                table: "PigExportRequestDetail",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "PigExportRequestDetail",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedTime",
                table: "PigExportRequestDetail",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "VaccinationSchedule",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    MedicinesId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VaccinationSchedule", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VaccinationSchedule_Medicines_MedicinesId",
                        column: x => x.MedicinesId,
                        principalTable: "Medicines",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_VaccinationSchedule_MedicinesId",
                table: "VaccinationSchedule",
                column: "MedicinesId");
        }
    }
}
