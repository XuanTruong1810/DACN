using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class WeighingDetail
    {
        public string WeighingHistoryId { get; set; }
        [ForeignKey("WeighingHistoryId")]
        public virtual WeighingHistory WeighingHistory { get; set; }

        public string PigId { get; set; }
        [ForeignKey("PigId")]
        public virtual Pigs Pigs { get; set; }

        public decimal Weight { get; set; }  // Trọng lượng của heo
        public string? Note { get; set; }     // Ghi chú nếu cần
    }
}