using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace Application.Services
{
    public class FeedIntakeService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IMapper mapper) : IFeedIntakeService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        private readonly IMapper mapper = mapper;
        public async Task<BasePagination<FeedRequirementModelView>> GetFeedRequirementsForArea(string areaId, int numberOfDays, int pageIndex, int pageSize)
        {
            if (string.IsNullOrWhiteSpace(areaId))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Khu vực không được chọn");
            }
            if (numberOfDays <= 0)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số ngày không được để trống");
            }

            // danh sách các chuồng
            List<Stables>? stables = await unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(a => a.AreasId == areaId)
                .ToListAsync();
            // danh sách các món ăn của khu vực
            List<Feeds>? feeds = await unitOfWork.GetRepository<Feeds>()
                .GetEntities
                .Where(f => f.AreasId == areaId)
                .ToListAsync();

            // Lấy ra số lượng heo hiện có trong khu vực
            int totalPigCount = stables.Sum(t => t.CurrentOccupancy);
            List<FeedRequirementModelView>? feedRequirements = new List<FeedRequirementModelView>();
            feeds.ForEach(feed =>
            {
                decimal totalFeedRequired = feed.FeedPerPig * totalPigCount * numberOfDays;
                feedRequirements.Add(new FeedRequirementModelView
                {
                    FeedName = feed.FeedName,
                    FeedId = feed.Id,
                    TotalFeedRequired = totalFeedRequired
                });
            });
            int totalCount = feedRequirements.Count;
            BasePagination<FeedRequirementModelView> paginationResult = new(feedRequirements, totalCount, pageIndex, pageSize);
            return paginationResult;
        }

        public async Task CreateFeedIntake(List<FeedIntakeInsertDTO> feedIntakeInsertDTOs)
        {
            string? createBy = httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Vui Lòng đăng nhập để thực hiện thao tác này.");
            if (feedIntakeInsertDTOs == null || !feedIntakeInsertDTOs.Any())
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Danh sách thức ăn không được rỗng.");
            }
            foreach (FeedIntakeInsertDTO f in feedIntakeInsertDTOs)
            {
                Feeds? feed = await unitOfWork.GetRepository<Feeds>().GetByIdAsync(f.FeedId)
                                 ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, $"Thức ăn với mã {f.FeedId} không tồn tại.");
                if (f.ExpectedQuantity <= 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng thức ăn {feed.FeedName} phải lớn hơn 0.");
                }
            }

            FeedInTakes? feedIntake = new FeedInTakes
            {
                CreateBy = createBy,
            };
            await unitOfWork.GetRepository<FeedInTakes>().InsertAsync(feedIntake);


            string? feedInTakeId = feedIntake.Id;
            List<FeedInTakeDetails>? feedInTakeDetailsList = mapper.Map<List<FeedInTakeDetails>>(feedIntakeInsertDTOs);


            foreach (FeedInTakeDetails f in feedInTakeDetailsList)
            {
                f.FeedInTakeId = feedInTakeId;

            }
            await unitOfWork.GetRepository<FeedInTakeDetails>().AddRangeAsync(feedInTakeDetailsList);
            await unitOfWork.SaveAsync();
        }



        public async Task AcceptFeedIntake(string feedInTakeId, FeedIntakeAcceptDTO feedIntakeAcceptDTO)
        {
            FeedInTakes? feedInTake = await unitOfWork.GetRepository<FeedInTakes>().GetByIdAsync(feedInTakeId)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phiếu thức ăn không tồn tại");
            if (feedInTake.ApprovedTime != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Phiếu thức ăn đã được chấp thuận");
            }

            mapper.Map(feedIntakeAcceptDTO, feedInTake);
            feedInTake.ApprovedTime = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<FeedInTakes>().UpdateAsync(feedInTake);


            foreach (FeedIntakeAcceptDetailDTO detail in feedIntakeAcceptDTO.FeedIntakeAcceptDetails)
            {
                FeedInTakeDetails? feedDetail = unitOfWork.GetRepository<FeedInTakeDetails>()
                .GetEntities.Where(df =>
                    df.FeedId == detail.FeedId && df.FeedInTakeId == feedInTakeId)
                    .FirstOrDefault() ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thức ăn không tồn tại trong hóa đơn");
                feedDetail.UnitPrice = detail.UnitPrice;
                await unitOfWork.GetRepository<FeedInTakeDetails>().UpdateAsync(feedDetail);
            }
            await unitOfWork.SaveAsync();
        }


        public async Task<FeedDeliveryModel> FeedIntakeDelivery(string feedInTakeId, FeedIntakeDeliveryDTO deliveryDTOs)
        {
            FeedInTakes? feedInTake = await unitOfWork.GetRepository<FeedInTakes>().GetByIdAsync(feedInTakeId)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phiếu thức ăn không tồn tại");

            if (!feedInTake.ApprovedTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Phiếu thức ăn chưa được chấp thuận");
            }
            if (feedInTake.IsInStock.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Phiếu thức ăn đã được chuyển vào kho");
            }
            decimal totalPrice = 0;
            foreach (FeedIntakeDeliveryDetailDTO delivery in deliveryDTOs.FeedIntakeDeliveryDetails)
            {
                if (delivery.AcceptedQuantity < 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng chấp nhận cho thức ăn {delivery.FeedId} phải lớn hơn 0.");
                }
                if (delivery.ReceivedQuantity < 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng giao thực tế cho thức ăn {delivery.FeedId} phải lớn hơn 0.");

                }

                FeedInTakeDetails? detail = await unitOfWork.GetRepository<FeedInTakeDetails>()
                    .GetEntities
                    .FirstOrDefaultAsync(d => d.FeedInTakeId == feedInTakeId && d.FeedId == delivery.FeedId)
                     ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, $"Chi tiết thức ăn với mã {delivery.FeedId} không tồn tại trong phiếu thức ăn.");

                if (delivery.AcceptedQuantity > detail.ExpectedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng chấp nhận cho thức ăn {delivery.FeedId} không được vượt quá số lượng dự kiến nhập.");
                }
                if (delivery.AcceptedQuantity > delivery.ReceivedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng chấp nhận cho thức ăn {delivery.FeedId} không được vượt quá số lượng giao tới.");
                }
                if (delivery.ReceivedQuantity > detail.ExpectedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng giao tới cho thức ăn {delivery.FeedId} không được vượt quá số lượng dự kiến nhập.");
                }
                detail.AcceptedQuantity = delivery.AcceptedQuantity;
                detail.ReceivedQuantity = delivery.ReceivedQuantity;
                detail.RejectedQuantity = delivery.ReceivedQuantity - delivery.AcceptedQuantity;
                await unitOfWork.GetRepository<FeedInTakeDetails>().UpdateAsync(detail);

                totalPrice += delivery.AcceptedQuantity * detail.UnitPrice;
            }
            feedInTake.TotalPrice = totalPrice;
            feedInTake.DeliveryDate = deliveryDTOs.DeliveryDate;
            feedInTake.RemainingAmount = totalPrice - feedInTake.Deposit;

            await unitOfWork.GetRepository<FeedInTakes>().UpdateAsync(feedInTake);

            await unitOfWork.SaveAsync();

            return new FeedDeliveryModel
            {
                FeedIntakeId = feedInTakeId,
                TotalPrice = feedInTake.TotalPrice.Value,
                RemainingAmount = feedInTake.RemainingAmount.GetValueOrDefault(),
            };
        }

        public async Task UpdateQuantityForFeed(string feedIntakeId)
        {
            FeedInTakes? feedInTake = await unitOfWork.GetRepository<FeedInTakes>().GetByIdAsync(feedIntakeId)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phiếu thức ăn không tồn tại");

            if (feedInTake.ApprovedTime == null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Phiếu thức ăn chưa được chấp thuận");
            }

            if (!feedInTake.DeliveryDate.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Phiếu thức ăn chưa được giao");
            }
            if (feedInTake.IsInStock.HasValue)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Phiếu thức ăn đã được chuyển vào kho");
            }

            List<FeedInTakeDetails> details = await unitOfWork.GetRepository<FeedInTakeDetails>()
                .GetEntities
                .Where(d => d.FeedInTakeId == feedIntakeId)
                .ToListAsync();

            foreach (FeedInTakeDetails detail in details)
            {
                Feeds? feed = await unitOfWork.GetRepository<Feeds>().GetByIdAsync(detail.FeedId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thức ăn không tồn tại");
                if (detail.AcceptedQuantity <= 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Lỗi hệ thống!");
                }
                else
                {
                    feed.FeedQuantity += detail.AcceptedQuantity.GetValueOrDefault();
                    await unitOfWork.GetRepository<Feeds>().UpdateAsync(feed);
                }

            }
            feedInTake.IsInStock = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<FeedInTakes>().UpdateAsync(feedInTake);

            await unitOfWork.SaveAsync();
        }


        public async Task<BasePagination<FeedIntakeResponseModel>> GetFeedIntake(DateTimeOffset? date, string? supplierId, string? statusManager, string? inStock, string? id, int pageIndex, int pageSize)
        {
            IQueryable<FeedInTakes> query = unitOfWork.GetRepository<FeedInTakes>().GetEntities;

            query = query.Where(d => d.DeleteTime == null);
            if (!string.IsNullOrEmpty(id))
            {
                query = query.Where(i => i.Id == id);
            }
            else
            {
                if (!string.IsNullOrEmpty(supplierId))
                {
                    query = query.Where(i => i.SuppliersId == supplierId);

                }
                if (!string.IsNullOrEmpty(statusManager))
                {
                    query = query.Where(i => i.ApprovedTime != null);
                }
                if (!string.IsNullOrEmpty(inStock))
                {
                    query = query.Where(i => i.IsInStock != null);
                }
                if (date.HasValue)
                {
                    query = query.Where(t => t.CreatedTime == date.Value);
                }
            }
            List<FeedInTakes> feedInTakes = await query.ToListAsync();
            List<FeedIntakeResponseModel> data = feedInTakes.Select(f => new FeedIntakeResponseModel
            {
                FeedInTakeId = f.Id,
                SupplierName = f.Suppliers != null ? f.Suppliers.Name : "Chưa chọn nhà cung cấp!",
                Deposit = f.Deposit.GetValueOrDefault(),
                TotalPrice = f.TotalPrice.GetValueOrDefault(),
                RemainingAmount = f.RemainingAmount.GetValueOrDefault(),
                ApprovedTime = f.ApprovedTime.GetValueOrDefault(),
                DeliveryDate = f.DeliveryDate.GetValueOrDefault(),
                Stoke = f.IsInStock.GetValueOrDefault(),
                CreatedTime = f.CreatedTime.GetValueOrDefault(),
                feedIntakeDetailResponseModels = f.FeedInTakeDetails.Select(i => new FeedIntakeDetailResponseModel
                {
                    FeedId = i.FeedId,
                    FeedName = i.Feeds.FeedName,
                    UnitPrice = i.UnitPrice,
                    ExpectedQuantity = i.ExpectedQuantity,
                    ReceivedQuantity = i.ReceivedQuantity.GetValueOrDefault(),
                    AcceptedQuantity = i.AcceptedQuantity.GetValueOrDefault(),
                    RejectedQuantity = i.RejectedQuantity.GetValueOrDefault(),
                }).ToList()
            }).ToList();


            BasePagination<FeedIntakeResponseModel> paginationResult = new(data, pageSize, pageIndex, await query.CountAsync());
            return paginationResult;
        }


        public async Task CancelFeedIntake(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống");
            }
            FeedInTakes? feedInTake = await unitOfWork.GetRepository<FeedInTakes>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy hóa đơn");

            feedInTake.DeleteTime = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<FeedInTakes>().UpdateAsync(feedInTake);

            await unitOfWork.SaveAsync();
        }




    }
}