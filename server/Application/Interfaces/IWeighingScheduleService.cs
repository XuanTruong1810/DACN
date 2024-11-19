using Application.DTOs.WeighingSchedule;
using Application.ModelViews.WeighingSchedule;

namespace Application.Interfaces
{
    public interface IWeighingScheduleService
    {
        // Quản lý lịch cân
        Task<WeighingScheduleModelView> CreateSchedule(CreateWeighingScheduleDto dto);
        Task<WeighingScheduleModelView> UpdateSchedule(UpdateWeighingScheduleDto dto);
        Task<bool> DeleteSchedule(string id);
        Task<bool> ToggleScheduleStatus(string id, bool isActive);

        // Truy vấn lịch cân
        Task<WeighingScheduleModelView> GetScheduleById(string id);
        Task<WeighingScheduleModelView> GetScheduleByArea(string areaId);
        Task<List<WeighingScheduleModelView>> GetAllSchedules();
        Task<List<WeighingScheduleModelView>> GetActiveSchedules();

        // Tính toán lịch cân
        Task<DateTime?> GetNextWeighingDate(string areaId);
        Task<List<string>> GetAreasNeedWeighingToday();
    }
}