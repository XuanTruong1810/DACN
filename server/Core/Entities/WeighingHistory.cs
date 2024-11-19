using System.ComponentModel.DataAnnotations.Schema;
namespace Core.Entities;

public class WeighingHistory : BaseEntity
{

    public DateTimeOffset WeighingDate { get; set; }
    public int TotalPigs { get; set; }  // Tổng số heo đã cân
    public decimal AverageWeight { get; set; }  // Trọng lượng trung bình
    public string Note { get; set; }
    public string CreatedBy { get; set; }
    [InverseProperty("WeighingHistory")]

    // Navigation property
    public virtual ICollection<WeighingDetail> WeighingDetails { get; set; } = new List<WeighingDetail>();
}