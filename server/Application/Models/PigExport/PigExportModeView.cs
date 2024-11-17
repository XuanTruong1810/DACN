namespace Application.Models.PigExport;
using System;

public class PigExportModelView
{
    public string Id { get; set; }
    public decimal Weight { get; set; }

    // Thông tin vị trí
    public string StableName { get; set; }
    public string AreaName { get; set; }


    public string AreaId { get; set; }

    public string StableId { get; set; }

    // Thông tin tiêm chủng và sức khỏe
    public bool IsVaccinationComplete { get; set; }
    public string HealthStatus { get; set; }
    public string? Note { get; set; }
}