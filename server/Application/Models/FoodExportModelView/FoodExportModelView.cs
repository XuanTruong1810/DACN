namespace Application.Models.FoodExportModelView
{
    public class FoodExportModelView
    {
        public string Id { get; set; }
        public DateTimeOffset ExportDate { get; set; }
        public string ExportBy { get; set; }
        public string Note { get; set; }
        public string AreaName { get; set; }

        public string ExportByName { get; set; }
        public decimal TotalQuantity { get; set; }
        public List<FoodExportDetailModelView> Details { get; set; }
    }

    public class FoodExportDetailModelView
    {
        public string FoodId { get; set; }
        public string FoodName { get; set; }

        public string Unit { get; set; } = "kg";
        public decimal Quantity { get; set; }
    }
}