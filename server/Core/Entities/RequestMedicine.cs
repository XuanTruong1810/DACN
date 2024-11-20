using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public enum RequestStatus
    {
        Draft = 0,          // Nháp
        Pending = 1,        // Chờ duyệt
        Completed = 2,      // Hoàn thành
        Rejected = 3        // Từ chối
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

        [ForeignKey("RequestMedicine")]
        public string RequestMedicineId { get; set; }
        [ForeignKey("Medicines")]
        public string MedicineId { get; set; }     // Thuốc/Vaccine
        public decimal Quantity { get; set; }     // Số lượng yêu cầu

        public RequestStatus Status { get; set; } = RequestStatus.Pending; // Trạng thái yêu cầu
        public string? Note { get; set; }
        public virtual RequestMedicine RequestMedicine { get; set; }
        public virtual Medicines Medicines { get; set; }
    }

}