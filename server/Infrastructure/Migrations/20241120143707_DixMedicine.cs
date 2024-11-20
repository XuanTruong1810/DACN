using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DixMedicine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicineImportDetail_MedicineSuppliers_MedicineSupplierId",
                table: "MedicineImportDetail");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineSuppliers_MedicineUnit_MedicineUnitId",
                table: "MedicineSuppliers");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineSuppliers_Medicines_MedicinesId",
                table: "MedicineSuppliers");

            migrationBuilder.DropForeignKey(
                name: "FK_RequestMedicineDetail_MedicineUnit_MedicineUnitId",
                table: "RequestMedicineDetail");

            migrationBuilder.DropTable(
                name: "MedicineUnit");

            migrationBuilder.DropTable(
                name: "Unit");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicineSuppliers",
                table: "MedicineSuppliers");

            migrationBuilder.DropIndex(
                name: "IX_MedicineSuppliers_MedicinesId",
                table: "MedicineSuppliers");

            migrationBuilder.DropIndex(
                name: "IX_MedicineSuppliers_MedicineUnitId_SupplierId",
                table: "MedicineSuppliers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicineImportDetail",
                table: "MedicineImportDetail");

            migrationBuilder.DropIndex(
                name: "IX_MedicineImportDetail_MedicineImportId",
                table: "MedicineImportDetail");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "MedicineSuppliers");

            migrationBuilder.DropColumn(
                name: "CreatedTime",
                table: "MedicineSuppliers");

            migrationBuilder.DropColumn(
                name: "MedicinesId",
                table: "MedicineSuppliers");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "MedicineSuppliers");

            migrationBuilder.DropColumn(
                name: "DaysBetweenInjections",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "NumberOfInjections",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "MedicineImportDetail");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "MedicineImportDetail");

            migrationBuilder.DropColumn(
                name: "ManufacturingDate",
                table: "MedicineImportDetail");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "MedicineImport");

            migrationBuilder.RenameColumn(
                name: "MedicineUnitId",
                table: "RequestMedicineDetail",
                newName: "MedicineId");

            migrationBuilder.RenameIndex(
                name: "IX_RequestMedicineDetail_MedicineUnitId",
                table: "RequestMedicineDetail",
                newName: "IX_RequestMedicineDetail_MedicineId");

            migrationBuilder.RenameColumn(
                name: "UpdatedTime",
                table: "MedicineSuppliers",
                newName: "LastUpdateTime");

            migrationBuilder.RenameColumn(
                name: "MedicineUnitId",
                table: "MedicineSuppliers",
                newName: "MedicineId");

            migrationBuilder.RenameColumn(
                name: "MedicineSupplierId",
                table: "MedicineImportDetail",
                newName: "MedicineId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineImportDetail_MedicineSupplierId",
                table: "MedicineImportDetail",
                newName: "IX_MedicineImportDetail_MedicineId");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreateTime",
                table: "MedicineSuppliers",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<bool>(
                name: "Status",
                table: "MedicineSuppliers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityInStock",
                table: "Medicines",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedTime",
                table: "MedicineImport",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeleteTime",
                table: "MedicineImport",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedTime",
                table: "MedicineImport",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicineSuppliers",
                table: "MedicineSuppliers",
                columns: new[] { "MedicineId", "SupplierId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicineImportDetail",
                table: "MedicineImportDetail",
                columns: new[] { "MedicineImportId", "MedicineId" });

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineImportDetail_Medicines_MedicineId",
                table: "MedicineImportDetail",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineSuppliers_Medicines_MedicineId",
                table: "MedicineSuppliers",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RequestMedicineDetail_Medicines_MedicineId",
                table: "RequestMedicineDetail",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicineImportDetail_Medicines_MedicineId",
                table: "MedicineImportDetail");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineSuppliers_Medicines_MedicineId",
                table: "MedicineSuppliers");

            migrationBuilder.DropForeignKey(
                name: "FK_RequestMedicineDetail_Medicines_MedicineId",
                table: "RequestMedicineDetail");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicineSuppliers",
                table: "MedicineSuppliers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicineImportDetail",
                table: "MedicineImportDetail");

            migrationBuilder.DropColumn(
                name: "CreateTime",
                table: "MedicineSuppliers");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "MedicineSuppliers");

            migrationBuilder.DropColumn(
                name: "QuantityInStock",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "CreatedTime",
                table: "MedicineImport");

            migrationBuilder.DropColumn(
                name: "DeleteTime",
                table: "MedicineImport");

            migrationBuilder.DropColumn(
                name: "UpdatedTime",
                table: "MedicineImport");

            migrationBuilder.RenameColumn(
                name: "MedicineId",
                table: "RequestMedicineDetail",
                newName: "MedicineUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_RequestMedicineDetail_MedicineId",
                table: "RequestMedicineDetail",
                newName: "IX_RequestMedicineDetail_MedicineUnitId");

            migrationBuilder.RenameColumn(
                name: "LastUpdateTime",
                table: "MedicineSuppliers",
                newName: "UpdatedTime");

            migrationBuilder.RenameColumn(
                name: "MedicineId",
                table: "MedicineSuppliers",
                newName: "MedicineUnitId");

            migrationBuilder.RenameColumn(
                name: "MedicineId",
                table: "MedicineImportDetail",
                newName: "MedicineSupplierId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineImportDetail_MedicineId",
                table: "MedicineImportDetail",
                newName: "IX_MedicineImportDetail_MedicineSupplierId");

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "MedicineSuppliers",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedTime",
                table: "MedicineSuppliers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MedicinesId",
                table: "MedicineSuppliers",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "MedicineSuppliers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DaysBetweenInjections",
                table: "Medicines",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NumberOfInjections",
                table: "Medicines",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Id",
                table: "MedicineImportDetail",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ExpiryDate",
                table: "MedicineImportDetail",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ManufacturingDate",
                table: "MedicineImportDetail",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedDate",
                table: "MedicineImport",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicineSuppliers",
                table: "MedicineSuppliers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicineImportDetail",
                table: "MedicineImportDetail",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Unit",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    UnitName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unit", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicineUnit",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MedicineId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UnitId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ConversionRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DeleteTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsBaseUnit = table.Column<bool>(type: "bit", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UnitName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicineUnit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicineUnit_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicineUnit_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicineSuppliers_MedicinesId",
                table: "MedicineSuppliers",
                column: "MedicinesId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineSuppliers_MedicineUnitId_SupplierId",
                table: "MedicineSuppliers",
                columns: new[] { "MedicineUnitId", "SupplierId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicineImportDetail_MedicineImportId",
                table: "MedicineImportDetail",
                column: "MedicineImportId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineUnit_MedicineId",
                table: "MedicineUnit",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineUnit_UnitId",
                table: "MedicineUnit",
                column: "UnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineImportDetail_MedicineSuppliers_MedicineSupplierId",
                table: "MedicineImportDetail",
                column: "MedicineSupplierId",
                principalTable: "MedicineSuppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineSuppliers_MedicineUnit_MedicineUnitId",
                table: "MedicineSuppliers",
                column: "MedicineUnitId",
                principalTable: "MedicineUnit",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineSuppliers_Medicines_MedicinesId",
                table: "MedicineSuppliers",
                column: "MedicinesId",
                principalTable: "Medicines",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RequestMedicineDetail_MedicineUnit_MedicineUnitId",
                table: "RequestMedicineDetail",
                column: "MedicineUnitId",
                principalTable: "MedicineUnit",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
