using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExportRequestDetail
    {
        public string PigExportRequestId { get; set; }
        public string PigId { get; set; }                    // Mã heo
        public decimal CurrentWeight { get; set; }           // Cân nặng hiện tại
        public string HealthStatus { get; set; }             // Tình trạng sức khỏe // good/bad/sick
        public string Status { get; set; } = "pending";      // pending/approved/rejected
        public string? Note { get; set; }
        [ForeignKey("PigId")]
        public virtual Pigs Pig { get; set; }
        [ForeignKey("PigExportRequestId")]
        public virtual PigExportRequest PigExportRequest { get; set; }
    }

}