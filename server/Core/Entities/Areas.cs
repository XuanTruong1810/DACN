using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Areas : BaseEntity
    {
        [Required]
        public string Name { get; set; }
        public string Description { get; set; }

        [InverseProperty("Areas")]
        public virtual ICollection<Stables> Stables { get; set; } = new List<Stables>();


        [InverseProperty("Areas")]
        public virtual ICollection<Feeds> Feeds { get; set; } = new List<Feeds>();
    }
}