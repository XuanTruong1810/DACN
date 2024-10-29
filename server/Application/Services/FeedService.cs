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
            feedExist.DeleteTime = DateTimeOffset.Now;

            await unitOfWork.GetRepository<Feeds>().UpdateAsync(feedExist);

            await unitOfWork.SaveAsync();
        }

        public async Task<BasePagination<FeedGetModel>> GetFeedAsync(FeedGetDTO feedGetDTO)
        {
            IQueryable<Feeds> query = unitOfWork.GetRepository<Feeds>().GetEntities;
            query = query.Where(f => f.DeleteTime == null);

            if (!string.IsNullOrWhiteSpace(feedGetDTO.FeedTypeId))
            {
                query = query.Where(f => f.FeedTypeId == feedGetDTO.FeedTypeId);
            }

            if (!string.IsNullOrWhiteSpace(feedGetDTO.AreasId))
            {
                query = query.Where(f => f.AreasId == feedGetDTO.AreasId);
            }

            if (!string.IsNullOrWhiteSpace(feedGetDTO.FeedQuantitySort))
            {
                query = feedGetDTO.FeedQuantitySort.ToLower() == "desc"
                    ? query.OrderByDescending(f => f.FeedQuantity)
                    : query.OrderBy(f => f.FeedQuantity);
            }

            List<Feeds>? feeds = await query.ToListAsync();
            List<FeedGetModel>? data = feeds.Select(f => new FeedGetModel
            {
                FeedId = f.Id,
                FeedName = f.FeedName,
                FeedQuantity = f.FeedQuantity,
                FeedTypeName = f.FeedTypes.FeedTypeName,
                Area = f.Areas.Name,
                FeedPerPig = f.FeedPerPig,
            }).ToList();
            BasePagination<FeedGetModel> basePagination = new(data, feedGetDTO.PageSize, feedGetDTO.PageIndex, await query.CountAsync());
            return basePagination;
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

            return mapper.Map<FeedGetModel>(feedExist);


        }

        public async Task<FeedGetModel> InsertFeedAsync(FeedInsertDTO feed)
        {
            Feeds? feedExist = await unitOfWork.GetRepository<Feeds>().GetEntities
                .Where(f => feed.FeedName == f.FeedName)
                .FirstOrDefaultAsync();
            if (feedExist is not null)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Món ăn này đã tồn tại");

            }
            Feeds? newFeed = mapper.Map<Feeds>(feed);

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


            if (feedExist.FeedName == feedUpdate.FeedName)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên thức ăn này đã tồn tại");
            }
            mapper.Map(feedUpdate, feedExist);


            await unitOfWork.GetRepository<Feeds>().UpdateAsync(feedExist);


            await unitOfWork.SaveAsync();

            return mapper.Map<FeedGetModel>(feedExist);
        }


    }
}