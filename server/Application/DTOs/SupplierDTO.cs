
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class SupplierDTO
    {
        [Required(ErrorMessage = "Tên nhà cung cấp dịch vụ là bắt buộc")]
        public string Name { get; set; }
        [Required(ErrorMessage = "Địa chỉ nhà cung cấp dịch vụ là bắt buộc")]
        public string Address { get; set; }
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        public string Phone { get; set; }
        [Required(ErrorMessage = "Loại nhà cung cấp dịch vụ là bắt buộc")]
        public string TypeSuppier { get; set; }
    }
}