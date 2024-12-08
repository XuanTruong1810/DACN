namespace Application.Models;
public class PigModelView
{
    public string Id { get; set; }
    public string StableId { get; set; }
    public string StableName { get; set; }
    public string AreaId { get; set; }
    public string AreaName { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public DateTimeOffset? UpdatedTime { get; set; }

}

public class PigInfoModelView : PigModelView
{
    public decimal Weight { get; set; }

    public string Status { get; set; }
    public List<PigVaccinationInfoModelView> PigVaccinations { get; set; }

}

public class PigVaccinationInfoModelView : PigModelView
{
    public string MedicineId { get; set; }
    public string MedicineName { get; set; }

    public DateTimeOffset? ScheduleDate { get; set; }

    public DateTimeOffset? ActualDate { get; set; }

    public DateTimeOffset? LastModifiedTime { get; set; }

    public string Status { get; set; }
}



public class PigVaccinationModelView : PigModelView
{
    public decimal Weight { get; set; }

    public string HealthStatus { get; set; }

    public string VaccinationStatus { get; set; }
}
