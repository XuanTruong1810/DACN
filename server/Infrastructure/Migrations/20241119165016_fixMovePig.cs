using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fixMovePig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MovePig",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MoveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FromArea = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToArea = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalPigs = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovePig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MovePigDetails",
                columns: table => new
                {
                    MovePigId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PigId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FromStable = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ToStable = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovePigDetails", x => new { x.MovePigId, x.PigId });
                    table.ForeignKey(
                        name: "FK_MovePigDetails_MovePig_MovePigId",
                        column: x => x.MovePigId,
                        principalTable: "MovePig",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovePigDetails_Pigs_PigId",
                        column: x => x.PigId,
                        principalTable: "Pigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovePigDetails_PigId",
                table: "MovePigDetails",
                column: "PigId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovePigDetails");

            migrationBuilder.DropTable(
                name: "MovePig");
        }
    }
}
