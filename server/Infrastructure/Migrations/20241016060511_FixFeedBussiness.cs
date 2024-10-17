using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixFeedBussiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StableFeeds");

            migrationBuilder.AddColumn<string>(
                name: "AreasId",
                table: "Feeds",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Feeds_AreasId",
                table: "Feeds",
                column: "AreasId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feeds_Areas_AreasId",
                table: "Feeds",
                column: "AreasId",
                principalTable: "Areas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feeds_Areas_AreasId",
                table: "Feeds");

            migrationBuilder.DropIndex(
                name: "IX_Feeds_AreasId",
                table: "Feeds");

            migrationBuilder.DropColumn(
                name: "AreasId",
                table: "Feeds");

            migrationBuilder.CreateTable(
                name: "StableFeeds",
                columns: table => new
                {
                    StableId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FeedId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FeedPerPig = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
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
                name: "IX_StableFeeds_FeedId",
                table: "StableFeeds",
                column: "FeedId");
        }
    }
}
