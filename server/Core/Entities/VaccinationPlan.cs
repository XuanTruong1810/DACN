using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class VaccinationPlan
    {
        public string PigId { get; set; }                   // FK heo
        public string MedicineId { get; set; }              // FK thuốc/vaccine
        public DateTime ScheduledDate { get; set; }         // Ngày dự kiến tiêm
        public DateTime? ActualDate { get; set; }           // Ngày tiêm thực tế
        public string Status { get; set; }                  // pending/completed/postponed/cancelled
        public bool CanVaccinate { get; set; } = true;      // Có thể tiêm không
        public string? Note { get; set; }
        public bool IsActive { get; set; } = true;

        public DateTimeOffset? DeleteTime { get; set; }


        public DateTimeOffset? LastModifiedTime { get; set; }

        [ForeignKey("PigId")]
        public virtual Pigs Pig { get; set; }

        [ForeignKey("MedicineId")]
        public virtual Medicines Medicine { get; set; }
    }
}