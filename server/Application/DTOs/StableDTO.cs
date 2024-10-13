using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class StableDTO
{
    [Required(ErrorMessage = "Stable name is required")]
    public string Name { get; set; }

    [Required(ErrorMessage = "Stable capacity is required")]
    [Range(1, 10, ErrorMessage = "Stable capacity must be at most 10")]
    public int Capacity { get; set; }

    public int CurrentOccupancy { get; set; } = 0;
    [Required(ErrorMessage = "AreasId is required")]
    public string AreasId { get; set; }
}