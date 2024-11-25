namespace Application.Models.Role;
public class RoleModelView
{
    public string Id { get; set; }
    public string Name { get; set; }
    public List<ClaimModelView> Claims { get; set; } = new List<ClaimModelView>();
}

public class ClaimModelView
{
    public string Type { get; set; }
    public string Value { get; set; }
}
