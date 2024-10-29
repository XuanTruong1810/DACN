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
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
        }
        Stables? stable = await unitOfWork.GetRepository<Stables>().GetByIdAsync(id)
        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Stable not found");
        if (stable.CurrentOccupancy > 0)
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Stable is not empty");
        }
        stable.DeleteTime = DateTimeOffset.Now;
        await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
        await unitOfWork.SaveAsync();
    }
    public async Task<StableModelView> InsertStable(StableDTO stableModel)
    {
        Stables? stable = await unitOfWork.GetRepository<Stables>().GetEntities.FirstOrDefaultAsync(s => s.Name == stableModel.Name);
        if (stable != null)
        {
            throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Stable already exist");
        }
        Stables? stables = mapper.Map<Stables>(stableModel);
        await unitOfWork.GetRepository<Stables>().InsertAsync(stables);
        await unitOfWork.SaveAsync();
        return mapper.Map<StableModelView>(stables);
    }

    public async Task<StableModelView> UpdateStable(string id, StableDTO stableModel)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
        }
        Stables? stable = await unitOfWork.GetRepository<Stables>().GetEntities
        .Where(s => s.Id == id)
        .FirstOrDefaultAsync()
        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Lỗi không tìm thấy chuồng!");

        if (stable.Name.ToLower().Equals(stableModel.Name.ToLower(), StringComparison.OrdinalIgnoreCase))
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên chuồng đã tồn tại!");
        }

        mapper.Map(stableModel, stable);

        await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
        await unitOfWork.SaveAsync();

        return mapper.Map<StableModelView>(stable);
    }

    public async Task<BasePagination<StableModelView>> GetAllStablesByArea(int pageIndex, int pageSize, string areaId)
    {
        IQueryable<StableModelView> stableQuery = unitOfWork.GetRepository<Stables>()
            .GetEntities
            .Where(s => s.DeleteTime == null && s.AreasId == areaId)
            .Select(s => new StableModelView
            {
                Id = s.Id,
                Name = s.Name,
                Capacity = s.Capacity,
                CurrentOccupancy = s.CurrentOccupancy,
                AreaName = s.Areas.Name
            });

        int totalCount = await stableQuery.CountAsync();
        if (totalCount == 0)
        {
            throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Stable not found");
        }
        List<StableModelView> paginatedItems = await stableQuery
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        BasePagination<StableModelView> paginationResult = new(paginatedItems, pageSize, pageIndex, totalCount);

        return paginationResult;
    }

    public async Task<StableModelView> GetStableById(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Id không được để trống");
        }

        Stables? stable = await unitOfWork.GetRepository<Stables>()
        .GetEntities
        .Where(s => s.DeleteTime == null && s.Id == id)
        .FirstOrDefaultAsync()
        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Chuồng không tìm thấy");

        return mapper.Map<StableModelView>(stable);
    }
}