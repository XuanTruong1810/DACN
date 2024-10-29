using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixForeignKeyIntake : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeedInTakes_Suppliers_SuppliersId",
                table: "FeedInTakes");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicationAndVaccineIntakes_Suppliers_SuppliersId",
                table: "MedicationAndVaccineIntakes");

            migrationBuilder.AlterColumn<string>(
                name: "SuppliersId",
                table: "MedicationAndVaccineIntakes",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "SuppliersId",
                table: "FeedInTakes",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddForeignKey(
                name: "FK_FeedInTakes_Suppliers_SuppliersId",
                table: "FeedInTakes",
                column: "SuppliersId",
                principalTable: "Suppliers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationAndVaccineIntakes_Suppliers_SuppliersId",
                table: "MedicationAndVaccineIntakes",
                column: "SuppliersId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeedInTakes_Suppliers_SuppliersId",
                table: "FeedInTakes");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicationAndVaccineIntakes_Suppliers_SuppliersId",
                table: "MedicationAndVaccineIntakes");

            migrationBuilder.AlterColumn<string>(
                name: "SuppliersId",
                table: "MedicationAndVaccineIntakes",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "SuppliersId",
                table: "FeedInTakes",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedInTakes_Suppliers_SuppliersId",
                table: "FeedInTakes",
                column: "SuppliersId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationAndVaccineIntakes_Suppliers_SuppliersId",
                table: "MedicationAndVaccineIntakes",
                column: "SuppliersId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
