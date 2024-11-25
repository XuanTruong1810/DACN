using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;
public class AreaDTO
{
    [Required(ErrorMessage = "Tên của khu vực là bắt buộc")]
    public required string Name { get; set; }
    [Required(ErrorMessage = "Mô tả của khu vực là bắt buộc")]
    public string? Description { get; set; }
    [Required(ErrorMessage = "Số lượng nhà của khu vực là bắt buộc")]
    public int TotalHouses { get; set; }
    [Required(ErrorMessage = "Số lượng nhà đã sử dụng của khu vực là bắt buộc")]
    public int OccupiedHouses { get; set; } = 0;
    [Required(ErrorMessage = "Trạng thái của khu vực là bắt buộc")]
    public string Status { get; set; } = "active";
    public string? WeighingFrequency { get; set; }
}