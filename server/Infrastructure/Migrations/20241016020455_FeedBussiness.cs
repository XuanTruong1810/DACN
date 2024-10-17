using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FeedBussiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeedInTakes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SuppliersId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Deposit = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    RemainingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ApprovedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeliveryDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedInTakes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedInTakes_Suppliers_SuppliersId",
                        column: x => x.SuppliersId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedTypes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FeedTypeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Feeds",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FeedName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FeedTypeId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feeds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Feeds_FeedTypes_FeedTypeId",
                        column: x => x.FeedTypeId,
                        principalTable: "FeedTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedInTakeDetails",
                columns: table => new
                {
                    FeedInTakeId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FeedId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedQuantity = table.Column<int>(type: "int", nullable: false),
                    ReceivedQuantity = table.Column<int>(type: "int", nullable: true),
                    AcceptedQuantity = table.Column<int>(type: "int", nullable: true),
                    RejectedQuantity = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedInTakeDetails", x => new { x.FeedInTakeId, x.FeedId });
                    table.ForeignKey(
                        name: "FK_FeedInTakeDetails_FeedInTakes_FeedInTakeId",
                        column: x => x.FeedInTakeId,
                        principalTable: "FeedInTakes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeedInTakeDetails_Feeds_FeedId",
                        column: x => x.FeedId,
                        principalTable: "Feeds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StableFeeds",
                columns: table => new
                {
                    StableId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FeedId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FeedPerPig = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StableFeeds", x => new { x.StableId, x.FeedId });
                    table.ForeignKey(
                        name: "FK_StableFeeds_Feeds_FeedId",
                        column: x => x.FeedId,
                        principalTable: "Feeds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StableFeeds_Stables_StableId",
                        column: x => x.StableId,
                        principalTable: "Stables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeedInTakeDetails_FeedId",
                table: "FeedInTakeDetails",
                column: "FeedId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedInTakes_SuppliersId",
                table: "FeedInTakes",
                column: "SuppliersId");

            migrationBuilder.CreateIndex(
                name: "IX_Feeds_FeedTypeId",
                table: "Feeds",
                column: "FeedTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_StableFeeds_FeedId",
                table: "StableFeeds",
                column: "FeedId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeedInTakeDetails");

            migrationBuilder.DropTable(
                name: "StableFeeds");

            migrationBuilder.DropTable(
                name: "FeedInTakes");

            migrationBuilder.DropTable(
                name: "Feeds");

            migrationBuilder.DropTable(
                name: "FeedTypes");
        }
    }
}
