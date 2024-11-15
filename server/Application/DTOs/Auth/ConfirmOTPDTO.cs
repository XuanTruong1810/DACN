using System.ComponentModel.DataAnnotations;
namespace Application.DTOs.Auth;
public class ConfirmOTPDTO
{
    [Required(ErrorMessage = "Email bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; }
    [Required(ErrorMessage = "OTP bắt buộc")]
    [MaxLength(6, ErrorMessage = "OTP không hợp lệ")]
    [MinLength(0, ErrorMessage = "OTP không hợp lệ")]
    [StringLength(6, ErrorMessage = "OTP không hợp lệ")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP không hợp lệ")]
    public string OTP { get; set; }
}