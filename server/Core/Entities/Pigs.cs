using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Core.Entities
{
    public class Pigs : BaseEntity
    {
        [ForeignKey("Stables")]
        public string StableId { get; set; }
        public virtual Stables Stables { get; set; }
        // trạng thái heo (alive, dead, sold)
        [Required]
        public string Status { get; set; } = "alive"; // alive, dead, pending, sold
        // thông tin heo chết
        public DateTimeOffset? DeathDate { get; set; }
        public string? DeathReason { get; set; }
        public string? DeathNote { get; set; }
        public string? HandlingMethod { get; set; }
        public string? HandlingNotes { get; set; }

        // thông tin heo đã bán
        public DateTimeOffset? SoldDate { get; set; }


        public decimal? Weight { get; set; }

        public string HealthStatus { get; set; } = "good";
        public string? Note { get; set; }


        public virtual ICollection<VaccinationPlan> VaccinationPlans { get; set; } = new List<VaccinationPlan>();

        // [InverseProperty("Pigs")]
        // public virtual ICollection<HealthRecordDetails> HealthRecordDetails { get; set; } = new List<HealthRecordDetails>();
    }
}