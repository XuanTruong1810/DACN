using Application.DTOs.PigWeighing;
using Core.Base;
namespace Application.Interfaces
{
    public interface IPigWeighingService
    {
        // Quản lý phiếu cân
        Task<PigWeighingDetailModelView> CreateWeighing(CreatePigWeighingDto dto);
        Task<bool> DeleteWeighing(string id);
        Task<bool> CancelWeighing(string id, string reason);

        // Thêm/Sửa chi tiết cân
        Task<WeighingItemModelView> AddWeighingDetail(AddWeighingDetailDto dto);
        Task<bool> DeleteWeighingDetail(string id);

        // Trạng thái phiếu cân
        Task<bool> StartWeighing(string id);  // Chuyển từ Draft sang InProgress
        Task<bool> CompleteWeighing(string id);  // Hoàn thành phiếu cân

        // Truy vấn phiếu cân
        Task<PigWeighingDetailModelView> GetWeighingById(string id);
        Task<BasePagination<PigWeighingListItemModelView>> GetWeighings(WeighingFilterDto filter);
        Task<List<PigWeighingListItemModelView>> GetWeighingsByArea(string areaId, DateTime? fromDate = null, DateTime? toDate = null);

        // Báo cáo và thống kê
        Task<WeighingReportModelView> GetWeighingReport(string areaId, DateTime fromDate, DateTime toDate);
        Task<List<ChartDataPoint>> GetWeightGainChart(string areaId, DateTime fromDate, DateTime toDate);
        Task<List<CageWeighingReportModelView>> GetCageWeighingReport(string areaId, DateTime fromDate, DateTime toDate);
    }
}