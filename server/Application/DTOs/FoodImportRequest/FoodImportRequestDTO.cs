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


public class FoodImportRequestDTO
{
    public List<FoodImportAcceptDTO> Accepts { get; set; }
    public List<FoodRejectDTO> Rejects { get; set; }
}

public class FoodImportAcceptDTO
{
    public DateTimeOffset ExpectedDeliveryTime { get; set; }
    public decimal Deposit { get; set; }
    public string SupplierId { get; set; }
    public List<FoodImportDetailDTO> Details { get; set; }
}

public class FoodImportDetailDTO
{
    public string FoodId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal ExpectedQuantity { get; set; }
}

public class FoodRejectDTO
{
    public string FoodId { get; set; }
    public string Reason { get; set; }
}