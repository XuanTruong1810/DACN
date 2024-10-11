using System.ComponentModel.DataAnnotations.Schema;
namespace Core.Entities
{
    public class Stables : BaseEntity
    {
        public string Name { get; set; }
        public int Capacity { get; set; }
        public int CurrentOccupancy { get; set; }

        [ForeignKey("Areas")]
        public string AreasId { get; set; }

        public virtual Areas Areas { get; set; }
        [InverseProperty("Stables")]
        public virtual ICollection<Pigs> Pigs { get; set; } = new List<Pigs>();
    }
}