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
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id bắt buộc");
        }

        var stable = await unitOfWork.GetRepository<Stables>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Chuồng không tìm thấy");

        // Kiểm tra chuồng còn heo không
        if (stable.CurrentOccupancy > 0)
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không thể xóa chuồng đang chứa heo");
        }

        stable.DeleteTime = DateTimeOffset.Now;
        await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
        await unitOfWork.SaveAsync();
    }

    public async Task<StableModelView> InsertStable(StableDTO stableModel)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(stableModel.Name))
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên chuồng không được để trống");
        }

        if (string.IsNullOrWhiteSpace(stableModel.AreasId))
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Khu vực không được để trống");
        }

        // Kiểm tra tên chuồng đã tồn tại
        Stables? existingStable = await unitOfWork.GetRepository<Stables>()
            .GetEntities
            .Where(s => s.DeleteTime == null && s.Name.ToLower() == stableModel.Name.ToLower())
            .FirstOrDefaultAsync();

        if (existingStable != null)
        {
            throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Tên chuồng đã tồn tại");
        }

        // Kiểm tra khu vực tồn tại
        Areas? area = await unitOfWork.GetRepository<Areas>().GetByIdAsync(stableModel.AreasId)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Khu vực không tồn tại");

        // Map và thêm mới
        Stables? stable = mapper.Map<Stables>(stableModel);
        await unitOfWork.GetRepository<Stables>().InsertAsync(stable);
        await unitOfWork.SaveAsync();

        // Map kết quả trả về bao gồm tên khu vực
        StableModelView? result = mapper.Map<StableModelView>(stable);
        result.AreaName = area.Name;

        return result;
    }

    public async Task<StableModelView> UpdateStable(string id, StableDTO stableModel)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id bắt buộc");
        }

        // Lấy thông tin chuồng cần cập nhật
        Stables? stable = await unitOfWork.GetRepository<Stables>()
            .GetEntities
            .Include(s => s.Areas)
            .FirstOrDefaultAsync(s => s.Id == id && s.DeleteTime == null)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Chuồng không tìm thấy");

        // Kiểm tra tên mới có bị trùng không (nếu có thay đổi tên)
        if (!stable.Name.Equals(stableModel.Name, StringComparison.OrdinalIgnoreCase))
        {
            var existingStable = await unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(s => s.DeleteTime == null &&
                           s.Name.ToLower() == stableModel.Name.ToLower() &&
                           s.Id != id)
                .FirstOrDefaultAsync();

            if (existingStable != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Tên chuồng đã tồn tại");
            }
        }

        // Kiểm tra capacity mới có nhỏ hơn số heo hiện tại không
        if (stableModel.Capacity < stable.CurrentOccupancy)
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                "Sức chứa mới không được nhỏ hơn số lượng heo hiện tại");
        }

        // Kiểm tra khu vực mới nếu có thay đổi
        if (stableModel.AreasId != stable.AreasId)
        {
            var newArea = await unitOfWork.GetRepository<Areas>().GetByIdAsync(stableModel.AreasId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Khu vực không tồn tại");
        }

        // Cập nhật thông tin
        mapper.Map(stableModel, stable);
        await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
        await unitOfWork.SaveAsync();

        // Map kết quả trả về
        StableModelView? result = mapper.Map<StableModelView>(stable);
        result.AreaName = stable.Areas.Name;

        return result;
    }

    public async Task<BasePagination<StableModelView>> GetAllStablesByArea(int pageIndex, int pageSize, string? areaId)
    {
        // Tạo query cơ bản
        var stableQuery = unitOfWork.GetRepository<Stables>()
            .GetEntities
            .Where(s => s.DeleteTime == null);

        // Thêm điều kiện areaId nếu có
        if (!string.IsNullOrEmpty(areaId))
        {
            stableQuery = stableQuery.Where(s => s.AreasId == areaId);
        }

        // Map sang StableModelView
        var stableModelQuery = stableQuery
            .Include(s => s.Areas)
            .Select(s => new StableModelView
            {
                Id = s.Id,
                Name = s.Name,
                Capacity = s.Capacity,
                CurrentOccupancy = s.CurrentOccupancy,
                AreaName = s.Areas.Name,
                Temperature = s.Temperature,
                Humidity = s.Humidity,
                Status = s.Status
            });

        // Đếm tổng số bản ghi
        var totalCount = await stableModelQuery.CountAsync();

        if (totalCount == 0)
        {
            throw new BaseException(
                StatusCodeHelper.NotFound,
                ErrorCode.NotFound,
                "Không tìm thấy chuồng nào"
            );
        }

        // Phân trang và sắp xếp
        var paginatedItems = await stableModelQuery
            .OrderBy(s => s.Name)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new BasePagination<StableModelView>(paginatedItems, pageSize, pageIndex, totalCount);
    }

    public async Task<StableModelView> GetStableById(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id bắt buộc");
        }

        Stables? stable = await unitOfWork.GetRepository<Stables>()
            .GetEntities
            .Include(s => s.Areas)
            .FirstOrDefaultAsync(s => s.DeleteTime == null && s.Id == id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Chuồng không tồn tại");

        StableModelView? result = mapper.Map<StableModelView>(stable);
        result.AreaName = stable.Areas.Name;

        return result;
    }
}