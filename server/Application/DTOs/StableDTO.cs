using System.ComponentModel.DataAnnotations;
using Core.Entities;

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

    [Required(ErrorMessage = "Temperature is required")]
    public string Temperature { get; set; }

    [Required(ErrorMessage = "Humidity is required")]
    public string Humidity { get; set; }

    [Required(ErrorMessage = "Status is required")]
    public StatusStables Status { get; set; }
}