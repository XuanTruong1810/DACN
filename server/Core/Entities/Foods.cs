using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Foods : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "active"; // active, inactive

        [ForeignKey("FoodTypes")]
        public string FoodTypesId { get; set; }
        public virtual FoodTypes FoodTypes { get; set; }

        public decimal QuantityInStock { get; set; } = 0;

        public string AreasId { get; set; }
        [ForeignKey("AreasId")]
        public virtual Areas Areas { get; set; }
        public double? QuantityPerMeal { get; set; } // số lượng thức ăn cho 1 bữa
        public int? MealsPerDay { get; set; } // số bữa ăn trong ngày

        [InverseProperty("Foods")]
        public virtual ICollection<FoodSuppliers> FoodSuppliers { get; set; } = new List<FoodSuppliers>();


        [InverseProperty("Food")]
        public virtual ICollection<FoodExportDetail> FoodExportDetails { get; set; } = new List<FoodExportDetail>();
    }
}