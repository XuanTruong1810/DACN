namespace Application.Models.FoodImportRequestModelView;
using Application.Models.FoodImportModelView;
using Application.Models.FoodModelView;

public class FoodImportRequestModelView
{
    public string Id { get; set; }
    public string CreatedById { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public string Note { get; set; }
    public string Status { get; set; }
    public List<FoodImportRequestDetailModelView> Details { get; set; }
}

public class FoodImportRequestDetailModelView
{
    public string Id { get; set; }
    public string FoodId { get; set; }
    public decimal ExpectedQuantity { get; set; }
    public FoodDetailModelView Food { get; set; }
}

public class FoodDetailModelView
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string FoodTypeName { get; set; }
    public string AreaName { get; set; }
    public List<FoodSupplierModelView> Suppliers { get; set; }
}

