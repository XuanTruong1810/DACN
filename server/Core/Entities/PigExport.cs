using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class PigExport : BaseEntity
    {
        public string Code { get; set; }                     // Mã phiếu xuất
        public string CustomerId { get; set; }               // Khách hàng
        public DateTimeOffset ExportDate { get; set; }       // Ngày xuất
        public string CreatedBy { get; set; }              // Người tạo
        public decimal TotalWeight { get; set; }             // Tổng cân nặng
        public decimal TotalAmount { get; set; }             // Tổng tiền

        public decimal UnitPrice { get; set; }             // Giá bán/kg

        public string? Note { get; set; }

        [ForeignKey("CustomerId")]
        public virtual Customers Customers { get; set; }
        [ForeignKey("PigExportRequestId")]
        public virtual PigExportRequest PigExportRequest { get; set; }
        [InverseProperty("PigExport")]
        public virtual ICollection<PigExportDetail> Details { get; set; }
    }
}