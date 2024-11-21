using Core.Entities;

namespace Application.Models.MedicineImportModelView
{
    public class MedicineImportModelView
    {
        public string Id { get; set; }
        public string SupplierId { get; set; }
        public string SupplierName { get; set; }
        public ImportStatus Status { get; set; }
        public DateTimeOffset CreateTime { get; set; }

        public string CreateBy { get; set; }
        public string CreateByName { get; set; }
        public DateTimeOffset? DeliveryTime { get; set; }

        public DateTimeOffset? StockTime { get; set; }

        public decimal TotalPrice { get; set; }

        public decimal TotalReceivedQuantity { get; set; }

        public DateTimeOffset ExpectedDeliveryTime { get; set; }
        public decimal Deposit { get; set; }

        public string Note { get; set; }

        public List<MedicineImportDetailModelView> Details { get; set; }
    }

    public class MedicineImportDetailModelView
    {
        public string MedicineId { get; set; }
        public string MedicineName { get; set; }

        public string Unit { get; set; }

        public decimal UnitPrice { get; set; }
        public bool IsVaccine { get; set; }
        public decimal ExpectedQuantity { get; set; }
        public decimal ActualQuantity { get; set; }
        public decimal RejectQuantity { get; set; }
        public decimal ReceivedQuantity { get; set; }
    }

}