using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class FeedTypeNonQueryDTO
    {
        [Required(ErrorMessage = "Tên loại thức ăn không được để trống!")]
        public string FeedTypeName { get; set; }
    }
}