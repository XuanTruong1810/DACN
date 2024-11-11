using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Foods : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "active";

        [ForeignKey("FoodTypes")]
        public string FoodTypesId { get; set; }
        public virtual FoodTypes FoodTypes { get; set; }

        public int QuantityInStock { get; set; } = 0;

        public string AreasId { get; set; }
        [ForeignKey("AreasId")]
        public virtual Areas Areas { get; set; }
        public double? QuantityPerMeal { get; set; }
        public int? MealsPerDay { get; set; }

        [InverseProperty("Foods")]
        public virtual ICollection<FoodSuppliers> FoodSuppliers { get; set; } = new List<FoodSuppliers>();
    }
}