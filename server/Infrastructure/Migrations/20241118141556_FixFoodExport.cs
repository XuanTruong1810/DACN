using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFoodExport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PigExport_PigExportRequest_PigExportRequestId",
                table: "PigExport");

            migrationBuilder.DropIndex(
                name: "IX_PigExport_PigExportRequestId",
                table: "PigExport");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "PigExport");

            migrationBuilder.DropColumn(
                name: "PigExportRequestId",
                table: "PigExport");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "PigExportDetail",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "FoodExport",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ExportDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ExportBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AreaName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodExport", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FoodExportDetail",
                columns: table => new
                {
                    FoodId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FoodExportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodExportDetail", x => new { x.FoodExportId, x.FoodId });
                    table.ForeignKey(
                        name: "FK_FoodExportDetail_FoodExport_FoodExportId",
                        column: x => x.FoodExportId,
                        principalTable: "FoodExport",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoodExportDetail_Foods_FoodId",
                        column: x => x.FoodId,
                        principalTable: "Foods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FoodExportDetail_FoodId",
                table: "FoodExportDetail",
                column: "FoodId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FoodExportDetail");

            migrationBuilder.DropTable(
                name: "FoodExport");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "PigExportDetail");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "PigExport",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PigExportRequestId",
                table: "PigExport",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PigExport_PigExportRequestId",
                table: "PigExport",
                column: "PigExportRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_PigExport_PigExportRequest_PigExportRequestId",
                table: "PigExport",
                column: "PigExportRequestId",
                principalTable: "PigExportRequest",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
