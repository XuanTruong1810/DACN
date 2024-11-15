using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PigDead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeathDate",
                table: "Pigs",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeathNote",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeathReason",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HandlingMethod",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HandlingNotes",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "SoldDate",
                table: "Pigs",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Pigs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeathDate",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "DeathNote",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "DeathReason",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "HandlingMethod",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "HandlingNotes",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "SoldDate",
                table: "Pigs");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Pigs");
        }
    }
}
