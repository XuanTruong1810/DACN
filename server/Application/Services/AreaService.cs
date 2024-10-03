using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{

    public class AreaService(IUnitOfWork unitOfWork, IMapper mapper) : IAreaService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;

        public async Task<BasePagination<AreaModelView>> GetAllAsync(int pageIndex, int pageSize)
        {
            IEnumerable<Areas>? areas = await unitOfWork.GetRepository<Areas>()
                .GetEntities.Where(x => x.DeleteTime == null).ToListAsync();
            if (!areas.Any())
            {
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Areas not found");
            }
            int totalCount = areas.Count();
            List<Areas>? pagedArea = areas
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            List<AreaModelView>? supplierModels = mapper.Map<List<AreaModelView>>(pagedArea);

            BasePagination<AreaModelView>? paginationResult = new(supplierModels, pageSize, pageIndex, totalCount);

            return paginationResult;
        }
        public async Task<AreaModelView> GetByIdAsync(string id)
        {
            Areas? area = await unitOfWork.GetRepository<Areas>().GetEntities
                                .Where(x => x.DeleteTime == null)
                                .FirstOrDefaultAsync(x => x.Id == id) ??
                 throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Area not found");
            return mapper.Map<AreaModelView>(area);
        }
        public async Task CreateAsync(AreaDTO area)
        {
            Areas? existingArea = await unitOfWork.GetRepository<Areas>()
                .GetEntities
                .Where(x => x.Name == area.Name && x.DeleteTime == null)
                .FirstOrDefaultAsync();

            if (existingArea != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Area with the same name already exists");
            }

            Areas? areaToCreate = mapper.Map<Areas>(area);
            await unitOfWork.GetRepository<Areas>().InsertAsync(areaToCreate);
            await unitOfWork.SaveAsync();
        }
        public async Task UpdateAsync(string id, AreaDTO area)
        {
            Areas? areaToUpdate = await unitOfWork.GetRepository<Areas>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Area not found");
            Areas? existingArea = await unitOfWork.GetRepository<Areas>()
               .GetEntities
               .Where(x => x.Name == area.Name && x.Id != id && x.DeleteTime == null)
               .FirstOrDefaultAsync();
            if (existingArea != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Area with the same name already exists");
            }

            areaToUpdate.UpdatedTime = DateTimeOffset.UtcNow;
            mapper.Map(area, areaToUpdate);
            await unitOfWork.GetRepository<Areas>().UpdateAsync(areaToUpdate);
            await unitOfWork.SaveAsync();
        }
        public async Task DeleteAsync(string id)
        {
            Areas? areaToDelete = await unitOfWork.GetRepository<Areas>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Area not found");
            areaToDelete.DeleteTime = DateTimeOffset.UtcNow;
            await unitOfWork.GetRepository<Areas>().UpdateAsync(areaToDelete);
            await unitOfWork.SaveAsync();
        }
    }
}
