using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;
public class Suppliers : BaseEntity
{
    public string Name { get; set; }
    public string Address { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string TypeSuppier { get; set; }
    public string Status { get; set; }
    [InverseProperty("Suppliers")]
    public virtual ICollection<MedicineSupplier> MedicineSuppliers { get; set; }
    [InverseProperty("Suppliers")]
    public virtual ICollection<MedicineImport> Imports { get; set; }


    [InverseProperty("Suppliers")]
    public virtual ICollection<PigIntakes> PigIntakes { get; set; } = new List<PigIntakes>();
}