namespace Application.Models.VaccinationPlan
{
    public class VaccinationPlanModelView
    {
        public DateTimeOffset ExaminationDate { get; set; }
        public int VaccinationQuantity { get; set; }

        public string MedicineName { get; set; }
    }
}