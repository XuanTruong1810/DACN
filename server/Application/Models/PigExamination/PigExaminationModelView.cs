namespace Application.Models.PigExamination
{
    public class PigExaminationModelView
    {
        public string Id { get; set; }
        public DateTimeOffset ExaminationDate { get; set; }

        public string CreatedBy { get; set; }

        public string CreatedByName { get; set; }

        public string? MedicineId { get; set; }

        public string? MedicineName { get; set; }

        public string ExaminationType { get; set; }

        public DateTimeOffset CreatedTime { get; set; }

        public List<PigExaminationDetailModelView>? PigExaminationDetails { get; set; }

    }

    public class PigExaminationDetailModelView
    {
        public string PigId { get; set; }

        public string Diagnosis { get; set; }

        public string TreatmentMethod { get; set; }

        public string? HealthNote { get; set; }

        public List<PigExaminationMedicineModelView>? PigExaminationMedicines { get; set; }
    }

    public class PigExaminationMedicineModelView
    {
        public string MedicineId { get; set; }
        public string MedicineName { get; set; }
        public decimal? MedicineQuantity { get; set; }
    }
}