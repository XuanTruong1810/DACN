namespace Application.Models.FoodTypeModelView
{
    public class FoodTypeModelView
    {
        public string Id { get; set; }
        public string FoodTypeName { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public int TotalProducts { get; set; } = 0;
    }
}