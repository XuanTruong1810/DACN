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

    public virtual ICollection<PigIntakes> PigIntakes { get; set; } = new List<PigIntakes>();


    [InverseProperty("Suppliers")]
    public virtual ICollection<FoodSuppliers> FoodSuppliers { get; set; } = new List<FoodSuppliers>();



    [InverseProperty("Suppliers")]
    public virtual ICollection<MedicineImport> MedicineImports { get; set; } = new List<MedicineImport>();

}