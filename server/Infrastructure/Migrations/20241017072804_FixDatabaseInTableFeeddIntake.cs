using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixDatabaseInTableFeeddIntake : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "FeedPerPig",
                table: "Feeds",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "FeedQuantity",
                table: "Feeds",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "IsInStock",
                table: "FeedInTakes",
                type: "datetimeoffset",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FeedPerPig",
                table: "Feeds");

            migrationBuilder.DropColumn(
                name: "FeedQuantity",
                table: "Feeds");

            migrationBuilder.DropColumn(
                name: "IsInStock",
                table: "FeedInTakes");
        }
    }
}
