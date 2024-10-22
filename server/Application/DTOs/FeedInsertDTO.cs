using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class FeedInsertDTO
    {
        [Required(ErrorMessage = "Tên thức ăn không được để trống!")]
        public string FeedName { get; set; }
        [Required(ErrorMessage = "Mã loại thức ăn không được để trống!")]
        public string FeedTypeId { get; set; }

        [Required(ErrorMessage = "Số lượng thức ăn cho 1 con heo không được để trống!")]
        [Range(0, 50, ErrorMessage = "Số lượng thức ăn cho 1 con heo không được vượt quá 50kg!")]
        public int FeedPerPig { get; set; } = 0;

        [Required(ErrorMessage = "Khu vực không được để trống!")]
        public string AreasId { get; set; }

        public int? FeedQuantity { get; set; } = 0;
    }
}