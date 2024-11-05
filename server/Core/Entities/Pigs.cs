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


        // [InverseProperty("Pigs")]
        // public virtual ICollection<HealthRecordDetails> HealthRecordDetails { get; set; } = new List<HealthRecordDetails>();
    }
}