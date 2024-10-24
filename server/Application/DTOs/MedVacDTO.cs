using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class MedVacDTO
    {
        [Required(ErrorMessage = "Tên thuốc hoặc chích không được để trống!")]
        public string MedVacName { get; set; }

        [Required(ErrorMessage = "Loại thuốc hoặc chích không được để trống!")]
        public MedVacType Type { get; set; }
        [Required(ErrorMessage = "Số lượng thuốc hoặc chích không được để trống!")]
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng thuốc hoặc chích phải lớn hơn hoặc bằng 0!")]
        public int Quantity { get; set; } = 0;
        [Required(ErrorMessage = "Nhà sản xuất thuốc hoặc chích không được để trống!")]
        public string Manufacturer { get; set; }

        public string? Description { get; set; }

        public string? DaysUsableAfterImport { get; set; }
        [Required(ErrorMessage = "Hết hạn thuốc hoặc chích không được để trống!")]
        public DateTimeOffset ExpiryDate { get; set; }


    }
}