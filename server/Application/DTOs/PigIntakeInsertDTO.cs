using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class PigIntakeInsertDTO
    {
        [Required(ErrorMessage = " ExpectedQuantity is required")]
        public string ExpectedQuantity { get; set; }

    }
}