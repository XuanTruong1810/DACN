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
        public virtual ICollection<RequestOrderDetail> Details { get; set; } = new List<RequestOrderDetail>();
        [InverseProperty("RequestMedicine")]
        public virtual ICollection<ImportMedicine> ImportMedicines { get; set; } = new List<ImportMedicine>();
    }
    public class RequestOrderDetail
    {
        [ForeignKey("RequestMedicine")]
        public string RequestId { get; set; }
        [ForeignKey("MedicineUnit")]
        public string MedicineUnitId { get; set; }     // Thuốc/Thức ăn
        public decimal Quantity { get; set; }     // Số lượng yêu cầu
        public string? Note { get; set; }
        public virtual RequestMedicine RequestMedicine { get; set; }
        public virtual MedicineUnit MedicineUnit { get; set; }
    }
    public class ImportMedicine
    {
        [Key]
        public string Id { get; set; }
        [ForeignKey("RequestMedicine")]
        public string RequestMedicineId { get; set; }  // Từ phiếu yêu cầu nào
        [ForeignKey("Suppliers")]
        public string SupplierId { get; set; }      // Nhà cung cấp
        public string CreatedBy { get; set; }       // Người tạo (quản lý)
        public string? ReceivedBy { get; set; }     // Người nhận
        public DateTimeOffset CreatedDate { get; set; }
        public DateTimeOffset? ReceivedDate { get; set; }
        public decimal TotalAmount { get; set; }    // Tổng tiền
        public string? Note { get; set; }
        public ImportStatus Status { get; set; }

        public virtual RequestMedicine RequestMedicine { get; set; }
        public virtual Suppliers Suppliers { get; set; }
        [InverseProperty("ImportMedicine")]
        public virtual ICollection<ImportOrderDetail> Details { get; set; }
    }
    public class ImportOrderDetail
    {
        [ForeignKey("ImportMedicine")]
        public string ImportId { get; set; }
        [ForeignKey("MedicineUnit")]
        public string MedicineUnitId { get; set; }
        public decimal Quantity { get; set; }      // Số lượng đặt
        public decimal Price { get; set; }         // Giá thỏa thuận
        public decimal Amount { get; set; }        // Thành tiền
        public DateTimeOffset? ExpiryDate { get; set; }  // Hạn sử dụng
        public decimal? ReceivedQuantity { get; set; }   // Số lượng thực nhận

        [ForeignKey("ImportMedicine")]
        public virtual ImportMedicine ImportMedicine { get; set; }
        [ForeignKey("MedicineUnit")]
        public virtual MedicineUnit MedicineUnit { get; set; }
    }

    public enum ImportStatus
    {
        Draft = 0,          // Nháp
        Ordered = 1,        // Đã đặt hàng
        Received = 2,       // Đã nhận hàng
        Completed = 3,      // Hoàn thành (đã nhập kho)
        Cancelled = 4       // Hủy
    }

}