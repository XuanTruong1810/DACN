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
                AreaName = p.Stables.Areas.Name,
                AreaId = p.Stables.Areas.Id
            })
            .Select(g => new CalenderWeighingModelView
            {
                WeighingDate = g.Key.WeighingDate,
                AreaName = g.Key.AreaName,
                AreaId = g.Key.AreaId,
                PigIds = g.Select(p => p.Id).ToList(),
                WeighingDetails = g.Select(p => new WeighingDetailModelView
                {
                    PigId = p.Id,
                    StableName = p.Stables.Name
                }).ToList()
            })
            .OrderBy(c => c.WeighingDate)
            .ToListAsync();

        return calenderWeighings;
    }
}