namespace Application.Models.FoodImportModelView
{


    public class FoodImportModelView
    {
        public string Id { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal? DepositAmount { get; set; }
        public decimal TotalReceivedQuantity { get; set; }
        public DateTimeOffset CreateTime { get; set; }
        public string CreateBy { get; set; }
        public string CreateByName { get; set; }
        public string ReceivedBy { get; set; }
        public string ReceivedByName { get; set; }
        public DateTimeOffset ExpectedDeliveryTime { get; set; }
        public DateTimeOffset? DeliveredTime { get; set; }
        public DateTimeOffset? StockTime { get; set; }

        public string Status { get; set; }  // pending, delivered, completed
        public string? Note { get; set; }
        public List<FoodImportDetailModelView> Details { get; set; }
    }

    public class FoodImportDetailModelView
    {
        public string FoodId { get; set; }
        public string FoodName { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal ExpectedQuantity { get; set; }
        public decimal? DeliveredQuantity { get; set; }
        public decimal? ActualQuantity { get; set; }
        public decimal? RejectedQuantity { get; set; }
        public string? Note { get; set; }
    }
}