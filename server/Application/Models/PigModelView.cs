namespace Application.Models;
public class PigModelView
{
    public string Id { get; set; }
    public string PigId { get; set; }
    public string StableId { get; set; }
    public string StableName { get; set; }
    public string AreaId { get; set; }
    public string AreaName { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public DateTimeOffset? UpdatedTime { get; set; }
}