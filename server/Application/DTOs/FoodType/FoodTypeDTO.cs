using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.FoodType
{
    public class FoodTypeDto
    {
        public string Id { get; set; }
        public string FoodTypeName { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int TotalProducts { get; set; }
    }

    public class CreateFoodTypeDto
    {
        [Required(ErrorMessage = "Tên loại thức ăn là bắt buộc")]
        public string FoodTypeName { get; set; }
        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        public string Description { get; set; }
        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public string Status { get; set; } = "active";
    }

    public class UpdateFoodTypeDto
    {
        public string? FoodTypeName { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }
}