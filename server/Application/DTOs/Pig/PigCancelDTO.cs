using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Pig
{
    public class PigCancelDTO
    {
        [Required(ErrorMessage = "Lý do chết là bắt buộc")]
        public string DeathReason { get; set; }
        [Required(ErrorMessage = "Ghi chú chết là bắt buộc")]
        public string DeathNote { get; set; }
        [Required(ErrorMessage = "Phương thức xử lý là bắt buộc")]
        public string HandlingMethod { get; set; }
        [Required(ErrorMessage = "Ghi chú xử lý là bắt buộc")]
        public string HandlingNotes { get; set; }
    }
}