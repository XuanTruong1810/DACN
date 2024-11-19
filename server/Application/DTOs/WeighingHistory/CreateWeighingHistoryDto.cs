using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.WeighingHistory;
public class CreateWeighingHistoryDto
{
    [Required]
    public string AreaId { get; set; }
    [Required]
    public DateTimeOffset WeighingDate { get; set; }
    public string? Note { get; set; }
    [Required]
    public List<WeighingDetailDto> WeighingDetails { get; set; }
}