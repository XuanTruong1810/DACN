using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.FoodImportRequest;
public class CreateFoodImportRequestDto
{
    public string? Note { get; set; }
    [Required]
    public List<CreateFoodImportRequestDetailDto> Details { get; set; }
}

public class CreateFoodImportRequestDetailDto
{
    [Required]
    public string FoodId { get; set; }
    [Required]
    [Range(0.1, double.MaxValue)]
    public decimal ExpectedQuantity { get; set; }
}

public class UpdateFoodImportRequestDto
{
    public string? Note { get; set; }
    [Required]
    public List<UpdateFoodImportRequestDetailDto> Details { get; set; }
}

public class UpdateFoodImportRequestDetailDto
{
    [Required]
    public string FoodId { get; set; }
    [Required]
    [Range(0.1, double.MaxValue)]
    public decimal ExpectedQuantity { get; set; }
}


public class ApproveFoodImportRequestDto
{
    [Required]
    public string Status { get; set; } // approved, rejected
}