namespace Application.Models.CalenderWeighingModelView;

public class CalenderWeighingModelView
{
    public DateTimeOffset WeighingDate { get; set; } // ngày cân
    public List<string> PigIds { get; set; } // id số heo cân
    public string AreaName { get; set; } // tên khu
    public List<WeighingDetailModelView> WeighingDetails { get; set; } = new();

}

public class WeighingDetailModelView
{
    public string PigId { get; set; }
    public string StableName { get; set; } // tên nhà
}
