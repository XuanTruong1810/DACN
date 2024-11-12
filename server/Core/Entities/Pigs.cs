using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Core.Entities
{
    public class Pigs : BaseEntity
    {

        [Required]
        public string PigId { get; set; }

        [ForeignKey("Stables")]
        public string StableId { get; set; }
        public virtual Stables Stables { get; set; }
        // trạng thái heo (alive, dead, sold)
        [Required]
        public string Status { get; set; } = "alive";
        // thông tin heo chết
        public DateTimeOffset? DeathDate { get; set; }
        public string? DeathReason { get; set; }
        public string? DeathNote { get; set; }
        public string? HandlingMethod { get; set; }
        public string? HandlingNotes { get; set; }

        // thông tin heo đã bán
        public DateTimeOffset? SoldDate { get; set; }


        // [InverseProperty("Pigs")]
        // public virtual ICollection<HealthRecordDetails> HealthRecordDetails { get; set; } = new List<HealthRecordDetails>();
    }
}