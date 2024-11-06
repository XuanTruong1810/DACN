using System.ComponentModel.DataAnnotations.Schema;
namespace Core.Entities
{
    public class Stables : BaseEntity
    {
        public string Name { get; set; }
        public int Capacity { get; set; } // sức chứa
        public int CurrentOccupancy { get; set; } // số lượng hiện tại

        [ForeignKey("Areas")]
        public string AreasId { get; set; }

        public virtual Areas Areas { get; set; }

        public string Temperature { get; set; }
        public string Humidity { get; set; }

        public StatusStables Status { get; set; }

        [InverseProperty("Stables")]
        public virtual ICollection<Pigs> Pigs { get; set; } = new List<Pigs>();
    }

    public enum StatusStables
    {
        Available, // còn trống
        Full, // đầy
        UnderMaintenance, // đang bảo trì
        StopWorking // ngừng hoạt động
    }
}