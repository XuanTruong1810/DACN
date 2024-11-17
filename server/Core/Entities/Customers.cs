using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;
public class Customers : BaseEntity
{
    public string Name { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string Note { get; set; }
    [InverseProperty("Customers")]
    public virtual ICollection<PigExport> PigExports { get; set; }
}