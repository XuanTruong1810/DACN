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
            IQueryable<Areas> areaQuery = unitOfWork.GetRepository<Areas>()
                .GetEntities.Where(x => x.DeleteTime == null);

            int totalCount = await areaQuery.CountAsync();
            if (totalCount == 0)
            {
                throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Areas not found");
            }

            BasePagination<Areas> pagedArea = await unitOfWork.GetRepository<Areas>().GetPagination(areaQuery, pageIndex, pageSize);

            List<AreaModelView> AreaModels = mapper.Map<List<AreaModelView>>(pagedArea.Items.ToList());

            BasePagination<AreaModelView> paginationResult = new(AreaModels, totalCount, pageIndex, pageSize);

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
        public async Task<AreaModelView> CreateAsync(AreaDTO area)
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

            return mapper.Map<AreaModelView>(areaToCreate);
        }
        public async Task<AreaModelView> UpdateAsync(string id, AreaDTO area)
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

            return mapper.Map<AreaModelView>(areaToUpdate);
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
