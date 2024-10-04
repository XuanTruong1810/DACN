using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class StableDTO
{
    [Required(ErrorMessage = "Stable name is required")]
    public string StableName { get; set; }

    [Required(ErrorMessage = "Stable capacity is required")]
    [MinLength(1, ErrorMessage = "Stable capacity must be at least 1")]
    [MaxLength(10, ErrorMessage = "Stable capacity must be at most 10")]
    public int Capacity { get; set; }

    public int CurrentOccupancy { get; set; } = 0;

    public int AreaId { get; set; }
}