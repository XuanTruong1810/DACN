using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Medicine
{
    public class CreateRequestMedicineDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập ghi chú")]
        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string Note { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập chi tiết yêu cầu")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất một loại thuốc")]
        public List<CreateRequestMedicineDetailDTO> Details { get; set; }
    }

    public class CreateRequestMedicineDetailDTO
    {
        [Required(ErrorMessage = "Vui lòng chọn đơn vị thuốc")]
        public string MedicineUnitId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số lượng")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public decimal Quantity { get; set; }

        public string? Note { get; set; }
    }

    public class UpdateRequestMedicineDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập ghi chú")]
        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string Note { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập chi tiết yêu cầu")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất một loại thuốc")]
        public List<UpdateRequestMedicineDetailDTO> Details { get; set; }
    }

    public class UpdateRequestMedicineDetailDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập ID chi tiết")]
        public string Id { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn đơn vị thuốc")]
        public string MedicineUnitId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số lượng")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public decimal Quantity { get; set; }

        public string? Note { get; set; }
    }

    public class ApproveRequestMedicineDTO
    {
        [Required(ErrorMessage = "Vui lòng chọn nhà cung cấp")]
        public string SupplierId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập chi tiết chấp thuận")]
        public List<ApproveRequestMedicineDetailDTO> Details { get; set; }
    }

    public class ApproveRequestMedicineDetailDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập ID chi tiết")]
        public string RequestDetailId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn thuốc của nhà cung cấp")]
        public string MedicineSupplierId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập đơn giá")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Đơn giá phải lớn hơn 0")]
        public decimal UnitPrice { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số lượng duyệt")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public decimal ApprovedQuantity { get; set; }
    }

    public class RejectRequestMedicineDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập lý do từ chối")]
        [StringLength(500, ErrorMessage = "Lý do từ chối không được vượt quá 500 ký tự")]
        public string RejectReason { get; set; }
    }

    public class ReceiveMedicineImportDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập chi tiết nhận hàng")]
        public List<ReceiveMedicineImportDetailDTO> Details { get; set; }
    }

    public class ReceiveMedicineImportDetailDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập ID thuốc của nhà cung cấp")]
        public string MedicineSupplierId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số lượng nhận")]
        [Range(0, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn hoặc bằng 0")]
        public decimal ReceivedQuantity { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số lượng chấp nhận")]
        [Range(0, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn hoặc bằng 0")]
        public decimal AcceptedQuantity { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập đơn giá")]
        [Range(0.1, double.MaxValue, ErrorMessage = "Đơn giá phải lớn hơn 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập ngày sản xuất")]
        public DateTimeOffset ManufacturingDate { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập hạn sử dụng")]
        public DateTimeOffset ExpiryDate { get; set; }

        public string? Note { get; set; }
    }
}