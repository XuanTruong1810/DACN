using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class FeedTypeNonQueryDTO
    {
        [Required(ErrorMessage = "Tên loại thức ăn là bắt buộc")]
        public string FeedTypeName { get; set; }

        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        public string Description { get; set; }
        public int? TotalProducts { get; set; } = 0;

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public string Status { get; set; }
    }
}