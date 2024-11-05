using Core.Entities;

namespace Application.ViewModels.Medicine
{
    public class MedicineRequestViewModel
    {
        public string Id { get; set; }
        public string RequestBy { get; set; }
        public string RequestByName { get; set; }
        public DateTimeOffset RequestDate { get; set; }
        public string Note { get; set; }
        public RequestStatus Status { get; set; }
        public string StatusDisplay { get; set; }
        public int TotalItems { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? RejectReason { get; set; }
    }

    public class MedicineRequestDetailViewModel : MedicineRequestViewModel
    {
        public List<RequestDetailItemViewModel> Details { get; set; }
        public MedicineImportViewModel Import { get; set; }
    }

    public class RequestDetailItemViewModel
    {
        public string Id { get; set; }
        public string MedicineUnitId { get; set; }
        public string MedicineName { get; set; }
        public string UnitName { get; set; }
        public decimal Quantity { get; set; }
        public string Note { get; set; }

        // Thông tin thêm về thuốc
        public string MedicineId { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }
        public bool IsVaccine { get; set; }
        public decimal ConversionRate { get; set; }
        public bool IsBaseUnit { get; set; }
    }
}