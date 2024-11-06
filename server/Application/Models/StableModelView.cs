using Core.Entities;

namespace Application.Models;

public class StableModelView
{
    public string Id { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }
    public int CurrentOccupancy { get; set; }
    public string AreaName { get; set; }
    public string Temperature { get; set; }
    public string Humidity { get; set; }
    public StatusStables Status { get; set; }

}