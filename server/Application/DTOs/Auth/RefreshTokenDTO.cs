using System.ComponentModel.DataAnnotations;
namespace Application.DTOs.Auth;
public class RefreshTokenDTO
{
    [Required(ErrorMessage = "RefreshToken không được để trống")]
    public string RefreshToken { get; set; }
}