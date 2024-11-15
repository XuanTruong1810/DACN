using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Auth
{
    public class EmailDTO
    {
        [Required(ErrorMessage = "Email bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }
    }
}