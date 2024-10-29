using System.Text.Json.Serialization;

namespace Application.Models
{
    public class FeedIntakeResponseModel
    {
        public string FeedInTakeId { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string SupplierName { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public decimal Deposit { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public decimal RemainingAmount { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public decimal TotalPrice { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public DateTimeOffset ApprovedTime { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public DateTimeOffset DeliveryDate { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public DateTimeOffset Stoke { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public DateTimeOffset CreatedTime { get; set; }


        public List<FeedIntakeDetailResponseModel> feedIntakeDetailResponseModels { get; set; } = new List<FeedIntakeDetailResponseModel>();

        // public string? CreateBy { get; set; }


    }

    public class FeedIntakeDetailResponseModel
    {
        public string FeedId { get; set; }
        public string FeedName { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]

        public decimal UnitPrice { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]

        public decimal ExpectedQuantity { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public decimal ReceivedQuantity { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]

        public decimal AcceptedQuantity { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]

        public decimal RejectedQuantity { get; set; }
    }
}