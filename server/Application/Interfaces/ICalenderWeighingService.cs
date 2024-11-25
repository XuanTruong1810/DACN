using Application.Models.CalenderWeighingModelView;

namespace Application.Interfaces;

public interface ICalenderWeighingService
{
    Task<List<CalenderWeighingModelView>> GetCalenderWeighingAsync();
}