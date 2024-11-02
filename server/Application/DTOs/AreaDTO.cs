using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;
public class AreaDTO
{
    [Required(ErrorMessage = "Area name is required")]
    public required string Name { get; set; }
    [Required(ErrorMessage = "Area description is required")]
    public string? Description { get; set; }
    [Required(ErrorMessage = "Area total houses is required")]
    public int TotalHouses { get; set; }
    [Required(ErrorMessage = "Area occupied houses is required")]
    public int OccupiedHouses { get; set; } = 0;
    [Required(ErrorMessage = "Status is required")]
    public string Status { get; set; } = "active";
}