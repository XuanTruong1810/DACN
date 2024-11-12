using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFood4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FoodImportRequestDetails_FoodImportRequests_FoodImportRequests",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_FoodImportRequestDetails_Foods_Foods",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropIndex(
                name: "IX_FoodImportRequestDetails_FoodImportRequests",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropIndex(
                name: "IX_FoodImportRequestDetails_Foods",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropColumn(
                name: "FoodImportRequests",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropColumn(
                name: "Foods",
                table: "FoodImportRequestDetails");

            migrationBuilder.CreateIndex(
                name: "IX_FoodImportRequestDetails_FoodId",
                table: "FoodImportRequestDetails",
                column: "FoodId");

            migrationBuilder.AddForeignKey(
                name: "FK_FoodImportRequestDetails_FoodImportRequests_FoodImportRequestId",
                table: "FoodImportRequestDetails",
                column: "FoodImportRequestId",
                principalTable: "FoodImportRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FoodImportRequestDetails_Foods_FoodId",
                table: "FoodImportRequestDetails",
                column: "FoodId",
                principalTable: "Foods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FoodImportRequestDetails_FoodImportRequests_FoodImportRequestId",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_FoodImportRequestDetails_Foods_FoodId",
                table: "FoodImportRequestDetails");

            migrationBuilder.DropIndex(
                name: "IX_FoodImportRequestDetails_FoodId",
                table: "FoodImportRequestDetails");

            migrationBuilder.AddColumn<string>(
                name: "FoodImportRequests",
                table: "FoodImportRequestDetails",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Foods",
                table: "FoodImportRequestDetails",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FoodImportRequestDetails_FoodImportRequests",
                table: "FoodImportRequestDetails",
                column: "FoodImportRequests");

            migrationBuilder.CreateIndex(
                name: "IX_FoodImportRequestDetails_Foods",
                table: "FoodImportRequestDetails",
                column: "Foods");

            migrationBuilder.AddForeignKey(
                name: "FK_FoodImportRequestDetails_FoodImportRequests_FoodImportRequests",
                table: "FoodImportRequestDetails",
                column: "FoodImportRequests",
                principalTable: "FoodImportRequests",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FoodImportRequestDetails_Foods_Foods",
                table: "FoodImportRequestDetails",
                column: "Foods",
                principalTable: "Foods",
                principalColumn: "Id");
        }
    }
}
