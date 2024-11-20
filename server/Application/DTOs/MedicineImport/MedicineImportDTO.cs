namespace Application.DTOs.MedicineImport
{
    public class MedicineImportDTO
    {
        public List<MedicineImportAcceptDTO> Accepts { get; set; }
        public List<MedicineRejectDTO> Rejects { get; set; }

    }

    public class MedicineImportAcceptDTO
    {
        public DateTimeOffset ExpectedDeliveryTime { get; set; } // Ngày dự kiến giao hàng
        public decimal Deposit { get; set; } // Tiền cọc

        public string SupplierId { get; set; }

        public string Status { get; set; } = "Pending";

        public string Note { get; set; }

        public List<MedicineImportDetailDTO> Details { get; set; }
    }
    public class MedicineImportDetailDTO
    {
        public string MedicineId { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal ExpectedQuantity { get; set; }

    }

    public class MedicineRejectDTO
    {
        public string MedicineId { get; set; }
        public string Reason { get; set; }
    }
}