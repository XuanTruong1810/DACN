using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;
public class Suppliers : BaseEntity
{
    public string Name { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public string TypeSuppier { get; set; }


    [InverseProperty("Suppliers")]
    public virtual ICollection<PigIntakes> PigIntakes { get; set; } = new List<PigIntakes>();
}