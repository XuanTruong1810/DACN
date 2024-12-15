using System.Text.Json.Serialization;

namespace Application.Models.CalenderWeighingModelView;

public class CalenderWeighingModelView
{
    public DateTimeOffset WeighingDate { get; set; } // ngày cân
    public List<WeighingDetailModelView> WeighingDetails { get; set; } = new();

}

public class WeighingDetailModelView
{
    public string PigId { get; set; }
    public string StableName { get; set; } // tên nhà
    public string AreaName { get; set; } // tên khu
    public string AreaId { get; set; } // id khu
    public DateTimeOffset? LastWeighingDate { get; set; } // ngày cân trước đó
}
