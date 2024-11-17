// Phiếu đề xuất xuất heo
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;
public class PigExportRequest : BaseEntity
{
    public string CreatedBy { get; set; }              // Người tạo đề xuất
    public string? ApprovedBy { get; set; }         // Người duyệt
    public DateTimeOffset RequestDate { get; set; }   // Ngày đề xuất
    public DateTimeOffset? ApprovalDate { get; set; } // Ngày duyệt
    public string Status { get; set; } = "pending";   // pending/approved/rejected/change_requested
    public string? Note { get; set; }
    public string? RejectReason { get; set; }          // Lý do từ chối nếu có
    [InverseProperty("PigExportRequest")]
    public virtual ICollection<PigExportRequestDetail> Details { get; set; }
}

