using Application.DTOs.MedicineImport;
using Application.Models.MedicineImportModelView;

namespace Application.Interfaces
{
    public interface IMedicineImportService
    {
        Task<MedicineImportModelView> GetMedicineImportById(string id);
        Task<List<MedicineImportModelView>> GetMedicineImports();


        Task<MedicineImportModelView> DeliveryMedicineImport(string id, MedicineImportAcceptIntakeDTO dto);


        Task<MedicineImportModelView> StockMedicineImport(string id);
    }
}