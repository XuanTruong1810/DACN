using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixMedicineImport2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicineImport_Suppliers_SuppliersId",
                table: "MedicineImport");

            migrationBuilder.DropIndex(
                name: "IX_MedicineImport_SuppliersId",
                table: "MedicineImport");

            migrationBuilder.DropColumn(
                name: "SuppliersId",
                table: "MedicineImport");

            migrationBuilder.AlterColumn<string>(
                name: "SupplierId",
                table: "MedicineImport",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineImport_SupplierId",
                table: "MedicineImport",
                column: "SupplierId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineImport_Suppliers_SupplierId",
                table: "MedicineImport",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicineImport_Suppliers_SupplierId",
                table: "MedicineImport");

            migrationBuilder.DropIndex(
                name: "IX_MedicineImport_SupplierId",
                table: "MedicineImport");

            migrationBuilder.AlterColumn<string>(
                name: "SupplierId",
                table: "MedicineImport",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<string>(
                name: "SuppliersId",
                table: "MedicineImport",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicineImport_SuppliersId",
                table: "MedicineImport",
                column: "SuppliersId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineImport_Suppliers_SuppliersId",
                table: "MedicineImport",
                column: "SuppliersId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }
    }
}
