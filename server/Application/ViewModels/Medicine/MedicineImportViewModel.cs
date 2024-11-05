using Core.Entities;

namespace Application.ViewModels.Medicine
{
    public class MedicineImportViewModel
    {
        public string Id { get; set; }
        public string RequestId { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByName { get; set; }
        public DateTimeOffset CreatedDate { get; set; }
        public ImportStatus Status { get; set; }
        public string StatusDisplay { get; set; }
        public decimal TotalAmount { get; set; }

        // Thông tin nhà cung cấp
        public string SupplierAddress { get; set; }
        public string SupplierPhone { get; set; }
        public string SupplierEmail { get; set; }
    }

    public class MedicineImportDetailViewModel : MedicineImportViewModel
    {
        public List<ImportDetailItemViewModel> Details { get; set; }
    }

    public class ImportDetailItemViewModel
    {
        public string Id { get; set; }
        public string MedicineSupplierId { get; set; }
        public string MedicineName { get; set; }
        public string UnitName { get; set; }
        public decimal ExpectedQuantity { get; set; }
        public decimal? ReceivedQuantity { get; set; }
        public decimal? AcceptedQuantity { get; set; }
        public decimal? RejectedQuantity { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public DateTimeOffset? ManufacturingDate { get; set; }
        public DateTimeOffset? ExpiryDate { get; set; }

        // Thông tin thêm về thuốc
        public string MedicineId { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }
        public bool IsVaccine { get; set; }
        public int? DaysAfterImport { get; set; }
        public decimal ConversionRate { get; set; }
        public bool IsBaseUnit { get; set; }
    }
}