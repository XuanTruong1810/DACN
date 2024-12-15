namespace Application.ModelViews.WeighingHistory;
public class WeighingHistoryModelView
{
    public string Id { get; set; }
    public DateTimeOffset WeighingDate { get; set; }
    public int TotalPigs { get; set; }
    public decimal AverageWeight { get; set; }
    public string Note { get; set; }
    public string CreatedBy { get; set; }
    public string CreatedByName { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public List<WeighingDetailModelView> Details { get; set; }
}