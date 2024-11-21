namespace Application.DTOs.MedicineImport;

public class MedicineImportAcceptIntakeDTO
{
    public DateTimeOffset DeliveryTime { get; set; }
    public List<MedicineImportDetailAcceptIntakeDTO> Details { get; set; }
}

public class MedicineImportDetailAcceptIntakeDTO
{
    public string MedicineId { get; set; }
    public decimal AcceptedQuantity { get; set; }

    public decimal ReceivedQuantity { get; set; }
}
