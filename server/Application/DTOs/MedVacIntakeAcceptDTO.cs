using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class MedVacIntakeAcceptDTO
    {
        public string SuppliersId { get; set; }
        public decimal Deposit { get; set; }
        public List<MedVacIntakeAcceptDetailDTO> MedVacIntakeAcceptDetails { get; set; }
    }
    public class MedVacIntakeAcceptDetailDTO
    {
        [Required(ErrorMessage = "Mã Thức ăn không được để trống")]
        public string MedVacId { get; set; }
        [Required(ErrorMessage = "Đơn giá của 1 sản phẩm không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Đơn giá của 1 sản phẩm phải lớn hơn 0")]
        public decimal UnitPrice { get; set; }

    }
}