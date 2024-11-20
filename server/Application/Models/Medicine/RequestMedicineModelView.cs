namespace Application.Models.Medicine;

public class RequestMedicineModelView
{
    public string Id { get; set; }
    public string CreatedById { get; set; }
    public DateTimeOffset CreatedTime { get; set; }
    public string Note { get; set; }
    public string Status { get; set; }
    public List<MedicineRequestDetailModelView> Details { get; set; }
}

public class MedicineRequestDetailModelView
{
    public string Id { get; set; }
    public string MedicineId { get; set; }
    public decimal ExpectedQuantity { get; set; }
    public MedicineDetailModelView Medicine { get; set; }
}

public class MedicineDetailModelView
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string MedicineTypeName { get; set; }
    public List<SupplierModelView> Suppliers { get; set; }
}

