using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class StableService(IUnitOfWork unitOfWork, IMapper mapper) : IStableService
{
    private readonly IUnitOfWork unitOfWork = unitOfWork;
    private readonly IMapper mapper = mapper;

    public async Task DeleteStable(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new BaseException(Core.Stores.StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
        }
        Stables? stable = await unitOfWork.GetRepository<Stables>().GetByIdAsync(id)
        ?? throw new BaseException(Core.Stores.StatusCodeHelper.NotFound, ErrorCode.NotFound, "Stable not found");
        if (stable.CurrentOccupancy > 0)
        {
            throw new BaseException(Core.Stores.StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Stable is not empty");
        }
        stable.DeleteTime = DateTimeOffset.Now;
        await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
        await unitOfWork.SaveAsync();
    }
    public async Task InsertStable(StableDTO stableModel)
    {
        Stables? stable = await unitOfWork.GetRepository<Stables>().GetEntities.FirstOrDefaultAsync(s => s.Name == stableModel.StableName);
        if (stable != null)
        {
            throw new BaseException(Core.Stores.StatusCodeHelper.Conflict, ErrorCode.Conflict, "Stable already exist");
        }
        Stables? stables = mapper.Map<Stables>(stableModel);
        await unitOfWork.GetRepository<Stables>().InsertAsync(stables);
        await unitOfWork.SaveAsync();
    }

    public async Task UpdateStable(string id, StableDTO stableModel)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new BaseException(Core.Stores.StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
        }
        Stables? stable = await unitOfWork.GetRepository<Stables>().GetEntities.FirstOrDefaultAsync(s => s.Name == stableModel.StableName && s.Id != id);
        if (stable != null)
        {
            throw new BaseException(Core.Stores.StatusCodeHelper.Conflict, ErrorCode.Conflict, "Stable already exist");
        }
        mapper.Map(stableModel, stable);
        await unitOfWork.SaveAsync();
    }

    public async Task<BasePagination<StableModelView>> GetAllStablesByArea(int pageIndex, int pageSize, string areaId)
    {
        IQueryable<Stables>? stableQuery = unitOfWork.GetRepository<Stables>()
        .GetEntities.Where(s => s.DeleteTime == null && s.AreasId == areaId);

        int totalCount = await stableQuery.CountAsync();
        if (totalCount == 0)
        {
            throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Stable not found");
        }
        BasePagination<Stables> basePagination =
            await unitOfWork.GetRepository<Stables>().GetPagination(stableQuery, pageIndex, pageSize);
        List<StableModelView>? model = mapper.Map<List<StableModelView>>(basePagination.Items.ToList());

        BasePagination<StableModelView>? paginationResult = new(model, pageSize, pageIndex, totalCount);

        return paginationResult;
    }
}