using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class FoodSuppliers
    {
        [ForeignKey("Foods")]
        public string FoodsId { get; set; }
        public virtual Foods Foods { get; set; }

        [ForeignKey("Suppliers")]
        public string SuppliersId { get; set; }
        public virtual Suppliers Suppliers { get; set; }

        public int QuantityInStock { get; set; } = 0;

        public string Status { get; set; } = "active";

        public DateTimeOffset CreatedTime { get; set; } = DateTimeOffset.Now;
        public DateTimeOffset? LastUpdatedTime { get; set; }
        public DateTimeOffset? DeletedTime { get; set; }
    }
}