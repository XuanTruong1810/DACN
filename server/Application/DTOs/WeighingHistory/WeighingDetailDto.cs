using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.WeighingHistory;
public class WeighingDetailDto
{
    [Required]
    public string PigId { get; set; }
    [Required]
    public decimal Weight { get; set; }

    public string? Note { get; set; }
}