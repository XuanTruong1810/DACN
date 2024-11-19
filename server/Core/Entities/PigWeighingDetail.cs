using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigWeighingDetails : BaseEntity
    {
        public string PigWeighingId { get; set; }
        [ForeignKey("PigWeighingId")]
        public virtual PigWeighings PigWeighing { get; set; }

        public string PigsId { get; set; }
        [ForeignKey("PigsId")]
        public virtual Pigs Pigs { get; set; }

        public decimal Weight { get; set; }           // Cân nặng hiện tại (kg)
        public decimal? PreviousWeight { get; set; }  // Cân nặng lần trước
        public decimal? WeightGain { get; set; }      // Tăng trọng
        public string Status { get; set; }            // Normal, Warning, Critical
        public string Note { get; set; }              // Ghi chú về tình trạng heo
    }
}