using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class FoodImportRequests : BaseEntity
{

    public string? Note { get; set; } // Ghi chú


    // Workflow:
    // [pending] ──┬──> [approved] ──> [completed]
    //             └──> [rejected]
    public string Status { get; set; } = "pending"; // pending, approved, rejected, completed

    public string CreatedById { get; set; }
    public string CreatedBy { get; set; }
    public DateTimeOffset? ApprovedTime { get; set; }

    [InverseProperty("FoodImportRequest")]
    public virtual ICollection<FoodImportRequestDetails> FoodImportRequestDetails { get; set; } = new List<FoodImportRequestDetails>();

    [InverseProperty("FoodImportRequest")]
    public virtual ICollection<FoodImports> FoodImports { get; set; } = new List<FoodImports>();
}