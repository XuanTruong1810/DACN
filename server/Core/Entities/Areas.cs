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
        public int TotalHouses { get; set; } = 0; // số nhà tối đa
        public int OccupiedHouses { get; set; } = 0; // số nhà đang sử dụng
        [Required]
        public string Status { get; set; }

        public int WeighingFrequency { get; set; } // đơn vị ngày


        [InverseProperty("Areas")]
        public virtual ICollection<Stables> Stables { get; set; } = new List<Stables>();

        [InverseProperty("Areas")]
        public virtual ICollection<Foods> Foods { get; set; } = new List<Foods>();

    }


}