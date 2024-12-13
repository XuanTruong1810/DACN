using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCode23 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RejectReason",
                table: "RequestMedicine");

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "FoodImportRequestDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "FoodImportRequestDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Note",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "FoodImportRequestDetails");

            migrationBuilder.AddColumn<string>(
                name: "RejectReason",
                table: "RequestMedicine",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
