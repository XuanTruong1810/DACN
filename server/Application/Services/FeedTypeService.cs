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
    public class FeedTypeService(IUnitOfWork unitOfWork, IMapper mapper) : IFeedTypeService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;

        public async Task DeleteFeedTypeService(string id)
        {
            FeedTypes? feedTypeExist = await unitOfWork.GetRepository<FeedTypes>()
                .GetEntities
                .Where(f => f.DeleteTime == null && f.Id == id)
                .FirstOrDefaultAsync() ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy loại thức ăn");

            feedTypeExist.DeleteTime = DateTimeOffset.Now;

            await unitOfWork.GetRepository<FeedTypes>().UpdateAsync(feedTypeExist);

            await unitOfWork.SaveAsync();

        }

        public async Task<FeedTypeGetModel> GetFeedById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống");
            }
            FeedTypes? feedType = await unitOfWork.GetRepository<FeedTypes>().GetEntities
                .Where(f => f.Id == id && f.DeleteTime == null)
                .FirstOrDefaultAsync()
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy loại thức ăn này");
            FeedTypeGetModel? result = mapper.Map<FeedTypeGetModel>(feedType);
            return result;
        }
        public async Task<FeedTypeGetModel> InsertFeedTypeService(FeedTypeNonQueryDTO dto)
        {
            FeedTypes? feedTypes = await unitOfWork.GetRepository<FeedTypes>()
                .GetEntities
                .Where(f => f.FeedTypeName == dto.FeedTypeName && f.DeleteTime == null)
                .FirstOrDefaultAsync();
            if (feedTypes is not null)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Đã tồn tài loại thức ăn này");
            }
            FeedTypes? newFeedType = mapper.Map<FeedTypes>(dto);

            await unitOfWork.GetRepository<FeedTypes>().InsertAsync(newFeedType);

            await unitOfWork.SaveAsync();
            return mapper.Map<FeedTypeGetModel>(newFeedType);


        }

        public async Task<FeedTypeGetModel> UpdateFeedTypeService(string id, FeedTypeNonQueryDTO dto)
        {
            FeedTypes? feedType = await unitOfWork.GetRepository<FeedTypes>().GetEntities
                .Where(f => f.Id == id && f.DeleteTime == null)
                .FirstOrDefaultAsync()
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy loại thức ăn này");

            if (string.Equals(feedType.FeedTypeName.ToLower(), dto.FeedTypeName.ToLower()))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Đã tồn tại loại thức ăn này");
            }

            mapper.Map(dto, feedType);
            feedType.UpdatedTime = DateTimeOffset.Now;

            await unitOfWork.GetRepository<FeedTypes>().UpdateAsync(feedType);

            await unitOfWork.SaveAsync();

            return mapper.Map<FeedTypeGetModel>(feedType);

        }

        public async Task<BasePagination<FeedTypeGetModel>> GetFeedTypesAsync(
            int pageIndex,
            int pageSize,
            string searchTerm,
            string status = "all")
        {

            var query = unitOfWork.GetRepository<FeedTypes>()
                .GetEntities
                .Where(x => x.DeleteTime == null);

            // Apply search
            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(x =>
                    x.FeedTypeName.ToLower().Contains(searchTerm) ||
                    x.Description.ToLower().Contains(searchTerm)
                );
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                query = query.Where(x => x.Status == status);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.CreatedTime)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => mapper.Map<FeedTypeGetModel>(x))
                .ToListAsync();

            return new BasePagination<FeedTypeGetModel>(items, pageSize, pageIndex, totalCount);
        }
    }
}