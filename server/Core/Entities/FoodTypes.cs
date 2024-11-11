using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FoodTypes : BaseEntity
    {
        [Required(ErrorMessage = "Tên loại thức ăn là bắt buộc")]
        public string FoodTypeName { get; set; }
        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public string Status { get; set; }

        public int TotalProducts { get; set; }

        [InverseProperty("FoodTypes")]
        public virtual ICollection<Foods> Foods { get; set; } = new List<Foods>();
    }
}