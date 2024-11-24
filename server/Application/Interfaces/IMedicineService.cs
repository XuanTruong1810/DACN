using Application.DTOs.Medicines;
using Application.Models.Medicine;

namespace Application.Interfaces
{
    public interface IMedicineService
    {
        Task<MedicineModelView> GetMedicineById(string id);
        Task<List<MedicineModelView>> GetAllMedicines(bool? isVaccine);
        Task<MedicineModelView> InsertMedicine(InsertMedicineDTO dto);
        Task<MedicineModelView> UpdateMedicine(string id, UpdateMedicineDTO dto);
        Task DeleteMedicine(string id);
    }
}