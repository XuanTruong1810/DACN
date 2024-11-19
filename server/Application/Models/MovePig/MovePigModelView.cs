namespace Application.Models.MovePig;

public class MovePigModelView
{
    public string Id { get; set; }
    public DateTime MoveDate { get; set; }
    public string FromArea { get; set; }
    public string ToArea { get; set; }
    public string? Note { get; set; }
    public int TotalPigs { get; set; }
    public string Status { get; set; }
    public List<MovePigDetailModelView> MovePigDetails { get; set; }
}
public class MovePigDetailModelView
{
    public string PigId { get; set; }
    public string FromStable { get; set; }
    public string ToStable { get; set; }

}
