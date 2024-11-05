using System.ComponentModel.DataAnnotations.Schema;
using Core.Entities;

public class Unit : BaseEntity
{
    public string UnitName { get; set; }
    [InverseProperty("Unit")]
    public virtual ICollection<Medicines> Medicines { get; set; }
}