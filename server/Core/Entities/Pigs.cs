using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Pigs : BaseEntity
    {

        public string PigId { get; set; }

        [ForeignKey("Stables")]
        public string StableId { get; set; }
        public Stables Stables { get; set; }
    }
}