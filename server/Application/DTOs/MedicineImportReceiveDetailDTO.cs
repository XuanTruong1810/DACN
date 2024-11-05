using System;
using System.ComponentModel.DataAnnotations;

public class MedicineImportReceiveDetailDTO
{
    [Required]
    public string MedicineSupplierId { get; set; }
    public decimal ExpectedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal AcceptedQuantity { get; set; }
    public decimal Price { get; set; }
    public DateTimeOffset ManufacturingDate { get; set; }
    public DateTimeOffset ExpiryDate { get; set; }
}