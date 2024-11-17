namespace Application.DTOs.Medicines
{
    public class UpdateMedicineDTO
    {
        public string? MedicineName { get; set; }
        public string? Description { get; set; }
        public string? Usage { get; set; }
        public bool? IsVaccine { get; set; }
        public int? DaysAfterImport { get; set; }
        public int? NumberOfInjections { get; set; }
        public int? DaysBetweenInjections { get; set; }
        public bool? IsActive { get; set; }
    }
}