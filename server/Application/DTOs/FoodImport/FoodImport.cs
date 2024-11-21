using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.FoodImport;
public class CreateFoodImportDto
{
    [Required]
    public string RequestId { get; set; }
    [Required]
    public string SupplierId { get; set; }
    [Required]
    public DateTimeOffset ExpectedDeliveryTime { get; set; }
    public decimal? DepositAmount { get; set; }
    public string? Note { get; set; }
    [Required]
    public List<CreateFoodImportDetailDto> Details { get; set; }
}

public class CreateFoodImportDetailDto
{
    [Required]
    public string FoodId { get; set; }
    [Required]
    [Range(0.1, double.MaxValue)]
    public decimal UnitPrice { get; set; }
    [Required]
    [Range(0.1, double.MaxValue)]
    public decimal ExpectedQuantity { get; set; }
}

public class UpdateDeliveryDto
{

    [Required]
    public List<UpdateDeliveryDetailDto> Details { get; set; }

    public DateTimeOffset DeliveryTime { get; set; }

    public string? Note { get; set; }
}

public class UpdateDeliveryDetailDto
{
    [Required]
    public string FoodId { get; set; }


    [Required]
    [Range(0, double.MaxValue)]
    public decimal ActualQuantity { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? ReceivedQuantity { get; set; }

    public string? Note { get; set; }
}