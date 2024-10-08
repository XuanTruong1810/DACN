using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class PigIntakeAcceptDTO
    {
        [Required(ErrorMessage = "SupplierId is required")]
        public string SupplierId { get; set; }
        [Required(ErrorMessage = "UnitPrice is required")]
        public decimal UnitPrice { get; set; }
        [Required(ErrorMessage = "Deposit is required")]
        public decimal Deposit { get; set; }
    }
}