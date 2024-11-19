using Application.DTOs.WeighingHistory;
using Application.ModelViews.WeighingHistory;

namespace Application.Interfaces;
public interface IWeighingHistoryService
{
    Task<WeighingHistoryModelView> CreateWeighingHistory(CreateWeighingHistoryDto dto);
    Task<WeighingHistoryModelView> GetWeighingHistoryById(string id);
    Task<List<WeighingHistoryModelView>> GetAllWeighingHistories();
    Task DeleteWeighingHistory(string id);
}