using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Areas : BaseEntity
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public int TotalHouses { get; set; }
        public int OccupiedHouses { get; set; } = 0;
        [Required]
        public string Status { get; set; }

        [InverseProperty("Areas")]
        public virtual ICollection<Stables> Stables { get; set; } = new List<Stables>();


        [InverseProperty("Areas")]
        public virtual ICollection<Feeds> Feeds { get; set; } = new List<Feeds>();


        [InverseProperty("Areas")]
        public virtual ICollection<Foods> Foods { get; set; } = new List<Foods>();
    }
}