namespace Application.ViewModels.Medicine
{
    public class MedicineSupplierViewModel
    {
        public string Id { get; set; }
        public string MedicineUnitId { get; set; }
        public string MedicineName { get; set; }
        public string UnitName { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string Note { get; set; }

        // Thông tin thêm
        public decimal CurrentQuantity { get; set; }
        public decimal ConversionRate { get; set; }
        public bool IsBaseUnit { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }
        public bool IsVaccine { get; set; }
        public int? DaysAfterImport { get; set; }
    }

    public class MedicineSupplierDetailViewModel : MedicineSupplierViewModel
    {
        public List<MedicineImportHistoryViewModel> ImportHistory { get; set; }
    }

    public class MedicineImportHistoryViewModel
    {
        public string ImportId { get; set; }
        public DateTimeOffset ImportDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public DateTimeOffset ManufacturingDate { get; set; }
        public DateTimeOffset ExpiryDate { get; set; }
    }
}