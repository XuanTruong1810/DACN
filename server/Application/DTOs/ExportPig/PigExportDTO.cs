namespace Application.DTOs.ExportPig
{
    public class PigExportDTO
    {
        public string CustomerId { get; set; }
        public DateTimeOffset ExportDate { get; set; }
        public string CreatedBy { get; set; }

        public decimal UnitPrice { get; set; }
        public decimal TotalWeight { get; set; }
        public decimal TotalAmount { get; set; }
        public List<PigExportDetailDTO> Details { get; set; }
    }
}