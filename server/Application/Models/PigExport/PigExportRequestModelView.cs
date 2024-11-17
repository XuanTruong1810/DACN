namespace Application.Models.PigExport
{
    public class PigExportRequestModelView
    {
        public string Id { get; set; }
        public string CreatedBy { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTimeOffset RequestDate { get; set; }
        public DateTimeOffset? ApprovalDate { get; set; }
        public string Status { get; set; } = "pending";
        public string? Note { get; set; }
        public string? RejectReason { get; set; }
        public List<PigExportRequestDetailModelView> Details { get; set; }
    }
}