using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public enum RequestStatus
    {
        Draft = 0,          // Nháp
        Pending = 1,        // Chờ duyệt
        Processing = 2,     // Đang xử lý (đã tạo phiếu nhập)
        Completed = 3,      // Hoàn thành
        Rejected = 4        // Từ chối
    }
    public class RequestMedicine
    {
        [Key]
        public string ID { get; set; }
        public string RequestBy { get; set; }     // Người yêu cầu
        public DateTimeOffset RequestDate { get; set; }
        public string? Note { get; set; }
        public RequestStatus Status { get; set; }
        public string? RejectReason { get; set; } // Lý do từ chối nếu có

        // Navigation properties
        [InverseProperty("RequestMedicine")]
        public virtual ICollection<RequestMedicineDetail> Details { get; set; } = new List<RequestMedicineDetail>();
        [InverseProperty("RequestMedicine")]
        public virtual ICollection<MedicineImport> MedicineImports { get; set; } = new List<MedicineImport>();
    }
    public class RequestMedicineDetail
    {
        [Key]
        public string Id { get; set; }

        [ForeignKey("RequestMedicine")]
        public string RequestMedicineId { get; set; }
        [ForeignKey("MedicineUnit")]
        public string MedicineUnitId { get; set; }     // Thuốc/Thức ăn
        public decimal Quantity { get; set; }     // Số lượng yêu cầu
        public string? Note { get; set; }
        public virtual RequestMedicine RequestMedicine { get; set; }
        public virtual MedicineUnit MedicineUnit { get; set; }
    }

}