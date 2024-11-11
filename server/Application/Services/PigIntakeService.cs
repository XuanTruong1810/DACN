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
namespace Application.Services
{
    public class PigIntakeService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor) : IPigIntakeService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        public async Task<BasePagination<PigInTakeModelView>> GetAllAsync(int pageIndex, int pageSize, string? filter)
        {
            IQueryable<PigIntakes>? pigIntakes = unitOfWork.GetRepository<PigIntakes>().GetEntities;
            if (!string.IsNullOrWhiteSpace(filter))
            {
                if (!pigIntakes.Any())
                {
                    throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "PigIntakes not found");
                }
                if (filter.Equals("Approved", StringComparison.CurrentCultureIgnoreCase))
                {
                    pigIntakes = pigIntakes.Where(x => x.ApprovedTime.HasValue);
                }
                else
                {
                    pigIntakes = pigIntakes.Where(x => !x.ApprovedTime.HasValue);
                }
            }
            int totalCount = await pigIntakes.CountAsync();
            BasePagination<PigIntakes> basePagination = await unitOfWork.GetRepository<PigIntakes>().GetPagination(pigIntakes, pageIndex, pageSize);

            List<PigInTakeModelView>? pigIntakeModels = mapper.Map<List<PigInTakeModelView>>(basePagination.Items.ToList());

            BasePagination<PigInTakeModelView>? paginationResult = new(pigIntakeModels, pageSize, pageIndex, totalCount);
            return paginationResult;
        }
        public async Task<PigInTakeModelView> GetPigIntakeByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }
            PigIntakes? pigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Not found");
            PigInTakeModelView result = mapper.Map<PigInTakeModelView>(pigIntake);

            return result;

        }

        // sau khi người ta giao hàng tới
        public async Task<PigDeliveryModel> UpdateIntakeAsync(string id, PigIntakeUpdateDTO model)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }
            PigIntakes? pigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy hóa đơn nhập heo!");

            if (!pigIntake.ApprovedTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn này chưa được quản lý chấp thuận!");
            }

            if (pigIntake.DeliveryDate.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn này đã xử lý khi giao tới rồi giao tới!");
            }

            if (pigIntake.StokeDate.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn này được xử lý");
            }

            if (model.AcceptedQuantity > pigIntake.ExpectedQuantity)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số lượng chấp thuận không được vượt quá số lượng dự kiến");
            }

            if (model.ReceivedQuantity > pigIntake.ExpectedQuantity)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số lượng giao tới không được vượt quá số lượng dự định đặt");
            }

            if (model.AcceptedQuantity > model.ReceivedQuantity)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số lượng chấp thuận không được vượt quá số lượng giao tới");
            }

            mapper.Map(model, pigIntake);

            pigIntake.RejectedQuantity = model.ReceivedQuantity - model.AcceptedQuantity;


            await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(pigIntake);

            pigIntake.TotalPrice = model.AcceptedQuantity * pigIntake.UnitPrice;
            pigIntake.RemainingAmount = pigIntake.TotalPrice - pigIntake.Deposit;
            pigIntake.DeliveryDate = DateTimeOffset.Now;

            await unitOfWork.SaveAsync();
            return new PigDeliveryModel
            {
                PigIntakeId = id,
                RemainingAmount = pigIntake.RemainingAmount.GetValueOrDefault(),
                TotalPrice = pigIntake.TotalPrice.GetValueOrDefault()
            };

        }




        public async Task<PigInTakeModelView> AcceptIntakeAsync(string id, PigIntakeAcceptDTO model)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }
            PigIntakes? pigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Not found");


            decimal totalPrice = model.UnitPrice * pigIntake.ExpectedQuantity;


            if (model.Deposit > totalPrice)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng trả tiền không được vượt quá số lượng dự kiến");
            }

            mapper.Map(model, pigIntake);

            pigIntake.ApprovedTime = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(pigIntake);
            await unitOfWork.SaveAsync();

            return mapper.Map<PigInTakeModelView>(pigIntake);

        }


        public async Task<PigInTakeModelView> InsertIntakeAsync(PigIntakeInsertDTO dTO)
        {
            List<Stables>? stables = await unitOfWork
            .GetRepository<Stables>()
            .GetEntities
            .Where(s => s.AreasId == dTO.AreasId)
            .ToListAsync();

            int totalEmptySlots = stables.Sum(s => s.Capacity - s.CurrentOccupancy);


            if (totalEmptySlots < dTO.ExpectedQuantity)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không đủ chỗ trống cho số lượng mong đợi. Chỉ còn trống {totalEmptySlots} chỗ.");
            }

            PigIntakes? pigIntake = mapper.Map<PigIntakes>(dTO);

            // Generate new ID format: PI_YYYYMMDD_XXX
            string dateStr = DateTime.Now.ToString("yyyyMMdd");
            int sequenceNumber = await unitOfWork.GetRepository<PigIntakes>()
                .GetEntities
                .CountAsync(x => x.Id.StartsWith($"PI_{dateStr}")) + 1;

            pigIntake.Id = $"PI_{dateStr}_{sequenceNumber:D3}"; // D3 ensures 3 digits with leading zeros

            string? CreateBy = httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Unauthorized");

            pigIntake.CreateBy = CreateBy;
            await unitOfWork.GetRepository<PigIntakes>().InsertAsync(pigIntake);
            await unitOfWork.SaveAsync();

            return mapper.Map<PigInTakeModelView>(pigIntake);

        }

        public async Task DeleteAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }
            PigIntakes? pigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Not found");
            if (pigIntake.ApprovedTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Cannot delete approved pig intake");
            }
            pigIntake.DeleteTime = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(pigIntake);

            await unitOfWork.SaveAsync();
        }


        public async Task<PigInTakeModelView> AllocatePigsToStableAsync(string AreasId, string pigIntakeId)
        {
            PigIntakes? PigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(pigIntakeId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy id của hóa đơn");

            if (!PigIntake.DeliveryDate.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn này chưa được giao hàng!");
            }

            if (PigIntake.StokeDate.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn này đã được nhập kho!");
            }

            List<Stables>? availableStables = await unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(s => s.Capacity > s.CurrentOccupancy && s.AreasId == AreasId)
                .OrderBy(s => s.CurrentOccupancy)
                .ToListAsync();

            if (!availableStables.Any())
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không có chuồng trại khả dụng trong khu vực này");
            }

            int totalAvailableSpace = availableStables.Sum(s => s.Capacity - s.CurrentOccupancy);
            int? pigAccept = PigIntake.AcceptedQuantity
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy số lượng hóa đơn đã chấp nhận");

            if (totalAvailableSpace < pigAccept)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    $"Không đủ chỗ trống trong khu vực. Cần {pigAccept} chỗ, hiện chỉ còn {totalAvailableSpace} chỗ trống");
            }

            int totalExistingPigsCount = await unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .CountAsync();

            List<Pigs> pigsList = new List<Pigs>();
            int stableIndex = 0;

            for (int i = 1; i <= pigAccept; i++)
            {
                Stables currentStable = availableStables[stableIndex];

                if (currentStable.CurrentOccupancy >= currentStable.Capacity)
                {
                    stableIndex++;
                    if (stableIndex >= availableStables.Count)
                    {
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                            "Lỗi phân bổ: Không đủ chuồng trại");
                    }
                    currentStable = availableStables[stableIndex];
                }

                string pigCode = $"{PigIntake.DeliveryDate:yyyyMMdd}_{totalExistingPigsCount + i}";

                Pigs newPig = new Pigs
                {
                    PigId = pigCode,
                    StableId = currentStable.Id,
                };
                pigsList.Add(newPig);

                currentStable.CurrentOccupancy++;
            }

            try
            {
                await unitOfWork.GetRepository<Pigs>().AddRangeAsync(pigsList);

                foreach (var stable in availableStables.Where(s => s.CurrentOccupancy > 0))
                {
                    await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
                }

                PigIntake.StokeDate = DateTimeOffset.Now;
                await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(PigIntake);

                await unitOfWork.SaveAsync();

                return mapper.Map<PigInTakeModelView>(PigIntake);
            }
            catch (Exception ex)
            {
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                    "Lỗi khi cập nhật dữ liệu: " + ex.Message);
            }
        }



    }
}