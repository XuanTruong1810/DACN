using Application.Interfaces;
using Application.Models.CalenderWeighingModelView;
using Core.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class CalenderWeighingService : ICalenderWeighingService
{
    private readonly IUnitOfWork _unitOfWork;
    public CalenderWeighingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

    }
    public async Task<List<CalenderWeighingModelView>> GetCalenderWeighingAsync()
    {
        List<CalenderWeighingModelView>? calenderWeighings = await _unitOfWork.GetRepository<Core.Entities.Pigs>().GetEntities
            .Where(p => p.Status != "dead" && p.Status != "sold" && p.NextWeighingDate != null)
            .GroupBy(p => new
            {
                WeighingDate = p.NextWeighingDate.Value,
            })
            .Select(g => new CalenderWeighingModelView
            {
                WeighingDate = g.Key.WeighingDate,
                WeighingDetails = g.Select(p => new WeighingDetailModelView
                {
                    PigId = p.Id,
                    StableName = p.Stables.Name,
                    AreaName = p.Stables.Areas.Name,
                    AreaId = p.Stables.Areas.Id,
                    LastWeighingDate = p.LastWeighingDate
                }).ToList()
            })
            .OrderBy(c => c.WeighingDate)
            .ToListAsync();

        return calenderWeighings;
    }
}