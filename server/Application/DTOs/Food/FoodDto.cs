using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Food
{
    public class FoodDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string FoodTypesId { get; set; }
        public int QuantityInStock { get; set; }
        public string FoodTypeName { get; set; }
    }
    public class CreateFoodDto
    {
        [Required(ErrorMessage = "Tên thức ăn là bắt buộc")]
        public string Name { get; set; }
        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        public string Description { get; set; }
        [Required(ErrorMessage = "Loại thức ăn là bắt buộc")]
        public string FoodTypesId { get; set; }
        public int QuantityInStock { get; set; } = 0;
        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public string Status { get; set; } = "active";
        public string AreasId { get; set; }
        public double? QuantityPerMeal { get; set; }
        public int? MealsPerDay { get; set; }
        public List<CreateFoodSupplierDto> FoodSuppliers { get; set; } = new List<CreateFoodSupplierDto>();

    }
    public class CreateFoodSupplierDto
    {
        public string SuppliersId { get; set; }
        public double QuantityPerMeal { get; set; }
        public string Status { get; set; } = "active";
    }

    public class UpdateFoodDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? FoodTypesId { get; set; }
        public int? QuantityInStock { get; set; }
        public string? Status { get; set; }
        public string? AreasId { get; set; }
        public double? QuantityPerMeal { get; set; }
        public int? MealsPerDay { get; set; }
        public List<UpdateFoodSupplierDto> FoodSuppliers { get; set; } = new List<UpdateFoodSupplierDto>();
    }
    public class UpdateFoodSupplierDto
    {
        public string? SuppliersId { get; set; }
        public string? Status { get; set; }
    }
}