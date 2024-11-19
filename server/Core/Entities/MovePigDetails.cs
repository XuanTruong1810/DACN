using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class MovePigDetails
{
    public string MovePigId { get; set; }
    public string PigId { get; set; }
    public string FromStable { get; set; }
    public string ToStable { get; set; }

    [ForeignKey("MovePigId")]
    public virtual MovePigs MovePigs { get; set; }
    [ForeignKey("PigId")]
    public virtual Pigs Pig { get; set; }
}
