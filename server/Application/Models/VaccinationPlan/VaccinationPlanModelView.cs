namespace Application.Models.VaccinationPlan
{
    public class VaccinationPlanModelView
    {
        public DateTimeOffset ExaminationDate { get; set; }
        public int VaccinationQuantity { get; set; }

        public string MedicineName { get; set; }
        public string VaccineId { get; set; }

        public List<PigSchedule> Pigs { get; set; }

    }

    public class PigSchedule
    {
        public string PigId { get; set; }
        public string StableName { get; set; }
    }
}