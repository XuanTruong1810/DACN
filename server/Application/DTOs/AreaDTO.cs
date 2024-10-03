using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;
public class AreaDTO
{
    [Required(ErrorMessage = "Area name is required")]
    public required string Name { get; set; }
    public string? Description { get; set; }
}