namespace Core.Entities
{
    // Phiếu nhập thuốc
    public class MedicineImport : BaseEntity
    {
        public string Code { get; set; }          // Mã phiếu
        public string SupplierId { get; set; }
        public DateTimeOffset ImportDate { get; set; }
        public string ImportBy { get; set; }      // Người nhập
        public decimal TotalAmount { get; set; }
        public string Note { get; set; }
        // public ImportStatus Status { get; set; }

        // Navigation properties
        public virtual Suppliers Suppliers { get; set; }
        public virtual ICollection<MedicineImportDetail> ImportDetails { get; set; }
    }
}