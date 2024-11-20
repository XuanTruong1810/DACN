using Application.Models.Medicine;

public class RequestMedicineModelView
{
    public string Id { get; set; }
    public string Status { get; set; }
    public string Note { get; set; }
    public string CreatedBy { get; set; }
    public string CreatedById { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public DateTimeOffset? ApprovedTime { get; set; }
    public List<RequestMedicineDetailModelView> Details { get; set; }
}

public class RequestMedicineDetailModelView
{
    public string MedicineId { get; set; }
    public string MedicineName { get; set; }
    public bool IsVaccine { get; set; }
    public string Unit { get; set; }
    public double Quantity { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; }

    public MedicineModelView Medicine { get; set; }
}
