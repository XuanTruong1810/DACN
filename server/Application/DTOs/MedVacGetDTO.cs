namespace Application.DTOs
{

    public enum MedVacType
    {
        Medicine,
        Vaccine
    }
    public class MedVacGetDTO
    {
        public string? MedVacName { get; set; }

        public MedVacType? Type { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}