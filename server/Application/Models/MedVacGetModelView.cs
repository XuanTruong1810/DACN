using System.Text.Json.Serialization;

namespace Application.Models
{
    public class MedVacGetModelView
    {
        public string Id { get; set; }

        public string MedVacName { get; set; }

        public string Type { get; set; }

        public int Quantity { get; set; }
        public string Manufacturer { get; set; }
        // mô tả
        public string Description { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int DaysUsableAfterImport { get; set; }
    }
}