namespace Application.Models
{
    public class PigInTakeModelView
    {
        public string Id { get; set; }
        public string SupplierId { get; set; }

        public decimal UnitPrice { get; set; }
        public decimal Deposit { get; set; }
        public decimal TotalPrice { get; set; }

        public int ExpectedQuantity { get; set; }
        public int ReceivedQuantity { get; set; }
        public int AcceptedQuantity { get; set; }
        public int RejectedQuantity { get; set; }
        public DateTimeOffset ApprovedTime { get; set; }
    }
}