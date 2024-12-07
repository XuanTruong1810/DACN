namespace Application.Models.FoodModelView
{
    public class FoodModelView
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string FoodTypesId { get; set; }
        public string FoodTypeName { get; set; }

        public int QuantityInStock { get; set; }
        public string AreasId { get; set; }
        public string AreasName { get; set; }
        public double? QuantityPerMeal { get; set; }
        public int? MealsPerDay { get; set; }
        public List<FoodSupplierModelView> FoodSupplierModelView { get; set; }
    }
    public class FoodSupplierModelView
    {
        public int QuantityInStock { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
    }
}