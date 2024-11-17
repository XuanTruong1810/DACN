namespace Application.DTOs.ExportPig
{
    public class PigExportRequestDetailDTO
    {
        public string PigId { get; set; }
        public decimal CurrentWeight { get; set; }

        public string HealthStatus { get; set; }
        public string? Note { get; set; }
    }
}