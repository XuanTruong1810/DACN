using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCOnfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PigExamninationMedicine");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "PigExamination",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExaminationNote",
                table: "PigExamination",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExaminationType",
                table: "PigExamination",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MedicineId",
                table: "PigExamination",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PigExaminationMedicine",
                columns: table => new
                {
                    PigExaminationDetailId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicineId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Quantity = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PigExaminationMedicine", x => new { x.PigExaminationDetailId, x.MedicineId });
                    table.ForeignKey(
                        name: "FK_PigExaminationMedicine_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PigExaminationMedicine_PigExaminationDetail_PigExaminationDetailId",
                        column: x => x.PigExaminationDetailId,
                        principalTable: "PigExaminationDetail",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PigExamination_MedicineId",
                table: "PigExamination",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_PigExaminationMedicine_MedicineId",
                table: "PigExaminationMedicine",
                column: "MedicineId");

            migrationBuilder.AddForeignKey(
                name: "FK_PigExamination_Medicines_MedicineId",
                table: "PigExamination",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PigExamination_Medicines_MedicineId",
                table: "PigExamination");

            migrationBuilder.DropTable(
                name: "PigExaminationMedicine");

            migrationBuilder.DropIndex(
                name: "IX_PigExamination_MedicineId",
                table: "PigExamination");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PigExamination");

            migrationBuilder.DropColumn(
                name: "ExaminationNote",
                table: "PigExamination");

            migrationBuilder.DropColumn(
                name: "ExaminationType",
                table: "PigExamination");

            migrationBuilder.DropColumn(
                name: "MedicineId",
                table: "PigExamination");

            migrationBuilder.CreateTable(
                name: "PigExamninationMedicine",
                columns: table => new
                {
                    PigExaminationDetailId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicineId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Quantity = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PigExamninationMedicine", x => new { x.PigExaminationDetailId, x.MedicineId });
                    table.ForeignKey(
                        name: "FK_PigExamninationMedicine_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PigExamninationMedicine_PigExaminationDetail_PigExaminationDetailId",
                        column: x => x.PigExaminationDetailId,
                        principalTable: "PigExaminationDetail",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PigExamninationMedicine_MedicineId",
                table: "PigExamninationMedicine",
                column: "MedicineId");
        }
    }
}
