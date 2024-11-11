using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFood2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AreasId",
                table: "Foods",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MealsPerDay",
                table: "Foods",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "QuantityPerMeal",
                table: "Foods",
                type: "float",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Foods_AreasId",
                table: "Foods",
                column: "AreasId");

            migrationBuilder.AddForeignKey(
                name: "FK_Foods_Areas_AreasId",
                table: "Foods",
                column: "AreasId",
                principalTable: "Areas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Foods_Areas_AreasId",
                table: "Foods");

            migrationBuilder.DropIndex(
                name: "IX_Foods_AreasId",
                table: "Foods");

            migrationBuilder.DropColumn(
                name: "AreasId",
                table: "Foods");

            migrationBuilder.DropColumn(
                name: "MealsPerDay",
                table: "Foods");

            migrationBuilder.DropColumn(
                name: "QuantityPerMeal",
                table: "Foods");
        }
    }
}
