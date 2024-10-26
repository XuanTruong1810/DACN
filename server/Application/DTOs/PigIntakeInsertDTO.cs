using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class PigIntakeInsertDTO
    {
        [Required(ErrorMessage = " ExpectedQuantity is required")]
        public int ExpectedQuantity { get; set; }

        [Required(ErrorMessage = " PigName is required")]
        public string AreasId { get; set; }

    }
}