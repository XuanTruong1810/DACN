using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class MovePigs : BaseEntity
{
    public DateTime MoveDate { get; set; }
    public string FromArea { get; set; } // Khu A
    public string ToArea { get; set; } // Khu B
    public string? Note { get; set; }
    public int TotalPigs { get; set; }
    public string Status { get; set; } = "pending"; // pending, completed
    public string CreateBy { get; set; }
    [InverseProperty("MovePigs")]
    public virtual ICollection<MovePigDetails> MovePigDetails { get; set; } = new List<MovePigDetails>();
}
