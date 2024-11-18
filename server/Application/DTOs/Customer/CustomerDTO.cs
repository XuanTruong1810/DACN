using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Customer;
public class CustomerDTO
{
    [Required(ErrorMessage = "Tên người đại diện bắt buộc")]
    public string Name { get; set; }
    public string? CompanyName { get; set; }
    [Required(ErrorMessage = "Địa chỉ bắt buộc")]
    public string Address { get; set; }
    [Required(ErrorMessage = "Số điện thoại bắt buộc")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string Phone { get; set; }
    [Required(ErrorMessage = "Email bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; }

    public string Note { get; set; }
}