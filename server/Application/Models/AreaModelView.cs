namespace Application.Models
{
    public class AreaModelView
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int TotalHouses { get; set; } = 0;
        public int OccupiedHouses { get; set; } = 0;
        public string Status { get; set; } = "active";
    }
}