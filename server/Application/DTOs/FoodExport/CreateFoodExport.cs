using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.FoodExport
{
    public class CreateFoodExportDto
    {
        [Required(ErrorMessage = "Ngày xuất phải được nhập")]
        public DateTimeOffset ExportDate { get; set; }
        public string Note { get; set; }
        [Required(ErrorMessage = "Tên khu vực phải được nhập")]
        public string AreaId { get; set; }
        [Required(ErrorMessage = "Chi tiết phải được nhập")]
        public List<CreateFoodExportDetailDto> Details { get; set; }
    }
    public class CreateFoodExportDetailDto
    {
        [Required(ErrorMessage = "Mã thức ăn phải được nhập")]
        public string FoodId { get; set; }

        [Required(ErrorMessage = "Số lượng phải được nhập")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public decimal Quantity { get; set; }
    }
}

