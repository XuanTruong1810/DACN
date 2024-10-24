namespace Application.Models
{
    public class MedVacIntakeResponseModel
    {
        public string MedVacIntakeId { get; set; }
        public string SupplierName { get; set; }

        public decimal Deposit { get; set; }

        public decimal RemainingAmount { get; set; }

        public string TotalPrice { get; set; }

        public string ApprovedTime { get; set; }

        public string DeliveryDate { get; set; }

        public string Stoke { get; set; }
    }
}