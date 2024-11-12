using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFood3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FoodImportRequests",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApprovedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodImportRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FoodImportRequestDetails",
                columns: table => new
                {
                    FoodImportRequestId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FoodId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ExpectedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Foods = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    FoodImportRequests = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodImportRequestDetails", x => new { x.FoodImportRequestId, x.FoodId });
                    table.ForeignKey(
                        name: "FK_FoodImportRequestDetails_FoodImportRequests_FoodImportRequests",
                        column: x => x.FoodImportRequests,
                        principalTable: "FoodImportRequests",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FoodImportRequestDetails_Foods_Foods",
                        column: x => x.Foods,
                        principalTable: "Foods",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FoodImports",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DepositAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ExpectedDeliveryTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeliveredTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FoodImportRequestId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SupplierId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodImports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodImports_FoodImportRequests_FoodImportRequestId",
                        column: x => x.FoodImportRequestId,
                        principalTable: "FoodImportRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoodImports_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FoodImportDetails",
                columns: table => new
                {
                    FoodImportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FoodId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DeliveredQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ActualQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RejectedQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodImportDetails", x => new { x.FoodImportId, x.FoodId });
                    table.ForeignKey(
                        name: "FK_FoodImportDetails_FoodImports_FoodImportId",
                        column: x => x.FoodImportId,
                        principalTable: "FoodImports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FoodImportDetails_Foods_FoodId",
                        column: x => x.FoodId,
                        principalTable: "Foods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FoodImportDetails_FoodId",
                table: "FoodImportDetails",
                column: "FoodId");

            migrationBuilder.CreateIndex(
                name: "IX_FoodImportRequestDetails_FoodImportRequests",
                table: "FoodImportRequestDetails",
                column: "FoodImportRequests");

            migrationBuilder.CreateIndex(
                name: "IX_FoodImportRequestDetails_Foods",
                table: "FoodImportRequestDetails",
                column: "Foods");

            migrationBuilder.CreateIndex(
                name: "IX_FoodImports_FoodImportRequestId",
                table: "FoodImports",
                column: "FoodImportRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_FoodImports_SupplierId",
                table: "FoodImports",
                column: "SupplierId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FoodImportDetails");

            migrationBuilder.DropTable(
                name: "FoodImportRequestDetails");

            migrationBuilder.DropTable(
                name: "FoodImports");

            migrationBuilder.DropTable(
                name: "FoodImportRequests");
        }
    }
}
