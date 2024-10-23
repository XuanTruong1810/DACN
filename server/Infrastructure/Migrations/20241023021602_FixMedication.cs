using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixMedication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_MedicationAndVaccineIntakeDetails_MedVacId",
                table: "MedicationAndVaccineIntakeDetails",
                column: "MedVacId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationAndVaccineIntakeDetails_MedicationAndVaccines_MedVacId",
                table: "MedicationAndVaccineIntakeDetails",
                column: "MedVacId",
                principalTable: "MedicationAndVaccines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationAndVaccineIntakeDetails_MedicationAndVaccines_MedVacId",
                table: "MedicationAndVaccineIntakeDetails");

            migrationBuilder.DropIndex(
                name: "IX_MedicationAndVaccineIntakeDetails_MedVacId",
                table: "MedicationAndVaccineIntakeDetails");
        }
    }
}
