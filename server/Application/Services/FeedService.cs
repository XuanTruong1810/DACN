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
    public class FeedService(IUnitOfWork unitOfWork, IMapper mapper) : IFeedService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;
        public async Task DeleteFeedAsync(string feedId)
        {
            Feeds? feedExist = await unitOfWork.GetRepository<Feeds>().GetEntities
                .Where(f => f.DeleteTime == null && f.Id == feedId)
                .FirstOrDefaultAsync() ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy thức ăn");

            var feedType = await unitOfWork.GetRepository<FeedTypes>().GetEntities
                .Where(ft => ft.Id == feedExist.FeedTypeId)
                .FirstOrDefaultAsync();
            if (feedType != null)
            {
                feedType.TotalProducts -= 1;
                await unitOfWork.GetRepository<FeedTypes>().UpdateAsync(feedType);
            }

            feedExist.DeleteTime = DateTimeOffset.Now;
            await unitOfWork.GetRepository<Feeds>().UpdateAsync(feedExist);
            await unitOfWork.SaveAsync();
        }

        public async Task<BasePagination<FeedGetModel>> GetFeedAsync(FeedGetDTO feedGetDTO)
        {
            IQueryable<Feeds> query = unitOfWork.GetRepository<Feeds>().GetEntities;

            // Lọc các feed chưa bị xóa
            query = query.Where(f => f.DeleteTime == null);

            // Tìm kiếm theo tên
            if (!string.IsNullOrWhiteSpace(feedGetDTO.Search))
            {
                query = query.Where(f => f.FeedName.ToLower().Contains(feedGetDTO.Search.ToLower()));
            }

            // Lọc theo loại thức ăn
            if (!string.IsNullOrWhiteSpace(feedGetDTO.FeedTypeId))
            {
                query = query.Where(f => f.FeedTypeId == feedGetDTO.FeedTypeId);
            }

            // Lọc theo khu vực
            if (!string.IsNullOrWhiteSpace(feedGetDTO.AreasId))
            {
                query = query.Where(f => f.AreasId == feedGetDTO.AreasId);
            }

            // Sắp xếp theo số lượng
            if (!string.IsNullOrWhiteSpace(feedGetDTO.FeedQuantitySort))
            {
                query = feedGetDTO.FeedQuantitySort.ToLower() == "desc"
                    ? query.OrderByDescending(f => f.FeedQuantity)
                    : query.OrderBy(f => f.FeedQuantity);
            }

            // Thực hiện query và map data
            var totalCount = await query.CountAsync();

            // Phân trang
            if (feedGetDTO.PageSize > 0)
            {
                query = query.Skip((feedGetDTO.PageIndex - 1) * feedGetDTO.PageSize)
                            .Take(feedGetDTO.PageSize);
            }

            List<Feeds> feeds = await query
                .Include(f => f.FeedTypes)
                .Include(f => f.Areas)
                .ToListAsync();

            List<FeedGetModel> data = feeds.Select(f => new FeedGetModel
            {
                Id = f.Id,
                FeedName = f.FeedName,
                FeedQuantity = f.FeedQuantity,
                FeedTypeName = f.FeedTypes.FeedTypeName,
                Area = f.Areas.Name,
                FeedPerPig = f.FeedPerPig,
            }).ToList();

            return new BasePagination<FeedGetModel>(
                data,
                feedGetDTO.PageSize,
                feedGetDTO.PageIndex,
                totalCount
            );
        }

        public async Task<FeedGetModel> GetFeedById(string feedId)
        {
            if (string.IsNullOrWhiteSpace(feedId))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống");
            }

            Feeds? feedExist = await unitOfWork.GetRepository<Feeds>().GetEntities
                .Where(f => f.DeleteTime == null && f.Id == feedId)
                .FirstOrDefaultAsync()
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy thức ăn này");
            FeedGetModel? data = mapper.Map<FeedGetModel>(feedExist);
            data.FeedTypeName = feedExist.FeedTypes.FeedTypeName;
            data.Area = feedExist.Areas.Name;
            return data;


        }

        public async Task<FeedGetModel> InsertFeedAsync(FeedInsertDTO dto)
        {
            Feeds? feedExist = await unitOfWork.GetRepository<Feeds>().GetEntities
                .Where(f => dto.FeedName == f.FeedName)
                .FirstOrDefaultAsync();
            if (feedExist is not null)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Món ăn này đã tồn tại");

            }
            Feeds? newFeed = mapper.Map<Feeds>(dto);

            var feedType = await unitOfWork.GetRepository<FeedTypes>().GetEntities
                .Where(ft => ft.Id == dto.FeedTypeId)
                .FirstOrDefaultAsync() ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy loại thức ăn");

            feedType.TotalProducts += 1;
            await unitOfWork.GetRepository<FeedTypes>().UpdateAsync(feedType);

            await unitOfWork.GetRepository<Feeds>().InsertAsync(newFeed);

            await unitOfWork.SaveAsync();

            return mapper.Map<FeedGetModel>(newFeed);


        }

        public async Task<FeedGetModel> UpdateFeedAsync(string feedId, FeedUpdateDTO feedUpdate)
        {
            if (string.IsNullOrWhiteSpace(feedId))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không được để trống!");
            }

            Feeds? feedExist = await unitOfWork.GetRepository<Feeds>().GetEntities
                .Where(f => f.Id == feedId)
                .FirstOrDefaultAsync() ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy thức ăn này");


            if (feedExist.DeleteTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Món ăn này đã bị xóa trong hệ thống");
            }
            if (feedExist.FeedName != feedUpdate.FeedName) // Chỉ kiểm tra khi tên thay đổi
            {
                Feeds? existingFeedWithSameName = await unitOfWork.GetRepository<Feeds>().GetEntities
                    .Where(f => f.FeedName == feedUpdate.FeedName && f.Id != feedId) // Kiểm tra trùng tên với các bản ghi khác
                    .FirstOrDefaultAsync();

                if (existingFeedWithSameName != null)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên thức ăn này đã tồn tại");
                }
            }



            if (feedExist.FeedTypeId != feedUpdate.FeedTypeId)
            {
                var oldFeedType = await unitOfWork.GetRepository<FeedTypes>().GetEntities
                    .Where(ft => ft.Id == feedExist.FeedTypeId)
                    .FirstOrDefaultAsync();
                if (oldFeedType != null)
                {
                    oldFeedType.TotalProducts -= 1;
                    await unitOfWork.GetRepository<FeedTypes>().UpdateAsync(oldFeedType);
                }

                var newFeedType = await unitOfWork.GetRepository<FeedTypes>().GetEntities
                    .Where(ft => ft.Id == feedUpdate.FeedTypeId)
                    .FirstOrDefaultAsync() ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy loại thức ăn mới");

                newFeedType.TotalProducts += 1;
                await unitOfWork.GetRepository<FeedTypes>().UpdateAsync(newFeedType);
            }

            mapper.Map(feedUpdate, feedExist);


            await unitOfWork.GetRepository<Feeds>().UpdateAsync(feedExist);


            await unitOfWork.SaveAsync();

            return mapper.Map<FeedGetModel>(feedExist);
        }
    }
}