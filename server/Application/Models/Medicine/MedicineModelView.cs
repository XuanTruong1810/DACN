using System.Text.Json.Serialization;

namespace Application.Models.Medicine
{
    public class MedicineModelView
    {
        public string Id { get; set; }
        public string MedicineName { get; set; }
        public string Description { get; set; }
        public string Usage { get; set; }
        public bool IsVaccine { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int? DaysAfterImport { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int? NumberOfInjections { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int? DaysBetweenInjections { get; set; }
        public bool IsActive { get; set; }
    }
}