using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class PigIntakeInsertDTO
    {
        [Required(ErrorMessage = "Số lượng dự kiến bắt buộc")]
        public int ExpectedQuantity { get; set; }

        [Required(ErrorMessage = "Mã khu vực bắt buộc")]
        public string AreasId { get; set; }

    }
}