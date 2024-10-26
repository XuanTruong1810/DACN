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
    public class MedicationAndVaccineIntakeService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork, IMapper mapper) : IMedicationAndVaccineIntakeService
    {
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;

        public async Task AcceptMedVacIntake(string medVacIntakeId, MedVacIntakeAcceptDTO DTO)
        {
            if (string.IsNullOrWhiteSpace(medVacIntakeId))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Phiếu nhập thuốc không được để trống!");
            }
            MedicationAndVaccineIntakes? medVacIntake = await unitOfWork
            .GetRepository<MedicationAndVaccineIntakes>()
            .GetByIdAsync(medVacIntakeId)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Hóa đơn không tồn tại");

            if (medVacIntake.ApprovedTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Hóa đơn đã được chấp thuận trước");
            }

            mapper.Map(DTO, medVacIntake);
            medVacIntake.ApprovedTime = DateTimeOffset.Now;


            foreach (MedVacIntakeAcceptDetailDTO detail in DTO.MedVacIntakeAcceptDetails)
            {
                MedicationAndVaccineIntakeDetails? medVacIntakeDetail = unitOfWork
                .GetRepository<MedicationAndVaccineIntakeDetails>()
                .GetEntities
                .Where(d => d.MedVacId == detail.MedVacId && d.MedVacIntakeId == medVacIntakeId)
                .FirstOrDefault()
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thức ăn không tồn tại trong hóa đơn");
                medVacIntakeDetail.UnitPrice = detail.UnitPrice;

                await unitOfWork.GetRepository<MedicationAndVaccineIntakeDetails>().UpdateAsync(medVacIntakeDetail);
            }
            await unitOfWork.SaveAsync();
        }

        public async Task CancelMedVacIntake(string medVacIntakeId)
        {
            if (string.IsNullOrWhiteSpace(medVacIntakeId))
            {
                throw new BaseException(Core.Stores.StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Mã Hóa đơn không được để trống");
            }
            MedicationAndVaccineIntakes? medVacIntake = await unitOfWork
            .GetRepository<MedicationAndVaccineIntakes>()
            .GetByIdAsync(medVacIntakeId)
             ?? throw new BaseException(Core.Stores.StatusCodeHelper.NotFound, ErrorCode.NotFound, "Hóa đơn không tồn tại");
            medVacIntake.DeleteTime = DateTimeOffset.Now;


            await unitOfWork.GetRepository<MedicationAndVaccineIntakes>().UpdateAsync(medVacIntake);

            await unitOfWork.SaveAsync();
        }

        public async Task CreateMedVacIntake(List<MedVacIntakeDTO> DTO)
        {
            string? createBy = httpContextAccessor.HttpContext.User.
            FindFirst(ClaimTypes.NameIdentifier)?.Value
             ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Vui Lòng đăng nhập để thực hiện thao tác này.");

            if (DTO == null || !DTO.Any())
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Danh sách thức ăn không được rỗng.");
            }

            foreach (MedVacIntakeDTO d in DTO)
            {
                MedicationAndVaccines? medVac = await unitOfWork
                .GetRepository<MedicationAndVaccines>()
                .GetByIdAsync(d.MedVacId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, $"Thức ăn với mã {d.MedVacId} không tồn tại.");

                if (d.ExpectedQuantity <= 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng thức ăn {medVac.MedVacName} phải lớn hơn 0.");
                }

                MedicationAndVaccineIntakes? newMedVacIntake = new MedicationAndVaccineIntakes
                {
                    CreateBy = createBy,
                };

                await unitOfWork.GetRepository<MedicationAndVaccineIntakes>().InsertAsync(newMedVacIntake);

                string? medVacIntakeId = newMedVacIntake.Id;
                List<MedicationAndVaccineIntakeDetails>? medVacIntakeDetailsList = mapper.Map<List<MedicationAndVaccineIntakeDetails>>(DTO);
                foreach (MedicationAndVaccineIntakeDetails m in medVacIntakeDetailsList)
                {
                    m.MedVacIntakeId = medVacIntakeId;

                };

                await unitOfWork.GetRepository<MedicationAndVaccineIntakeDetails>().AddRangeAsync(medVacIntakeDetailsList);
                await unitOfWork.SaveAsync();
            }
        }

        public async Task<MedVacDeliveryModel> MedVacIntakeDelivery(string medVacIntakeId, MedVacDeliveryDTO DTO)
        {
            if (string.IsNullOrWhiteSpace(medVacIntakeId))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Mã hóa đơn không được để trống");
            }

            MedicationAndVaccineIntakes? medVacIntake = await unitOfWork
            .GetRepository<MedicationAndVaccineIntakes>()
            .GetByIdAsync(medVacIntakeId)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Hóa đơn không tồn tại");

            if (!medVacIntake.ApprovedTime.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn chưa được chấp thuận");
            }
            if (!medVacIntake.IsInStock.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Hóa đơn chưa được chuyển vào kho");
            }
            decimal totalPrice = 0;
            foreach (MedVacDeliveryDetailDTO delivery in DTO.MedVacDeliveryDetails)
            {
                if (delivery.AcceptedQuantity < 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng chấp nhận cho thức ăn {delivery.MedVacId} phải lớn hơn 0.");
                }
                if (delivery.ReceivedQuantity < 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng giao thực tế cho thức ăn {delivery.MedVacId} phải lớn hơn 0.");
                }
                MedicationAndVaccineIntakeDetails? detail = await unitOfWork
                .GetRepository<MedicationAndVaccineIntakeDetails>()
                .GetEntities
                .Where(d => d.MedVacId == delivery.MedVacId && d.MedVacIntakeId == medVacIntakeId)
                .FirstOrDefaultAsync()
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, $"Chi tiết thức ăn với mã {delivery.MedVacId} không tồn tại trong phiếu thức ăn.");

                if (delivery.AcceptedQuantity > detail.ExpectedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng chấp nhận cho thức ăn {delivery.MedVacId} không được vượt quá số lượng dự kiến nhập.");
                }
                if (delivery.AcceptedQuantity > delivery.ReceivedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng chấp nhận cho thức ăn {delivery.MedVacId} không được vượt quá số lượng giao tới.");
                }
                if (delivery.ReceivedQuantity > detail.ExpectedQuantity)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Số lượng giao tới cho thức ăn {delivery.MedVacId} không được vượt quá số lượng dự kiến nhập.");
                }
                detail.AcceptedQuantity = delivery.AcceptedQuantity;
                detail.ReceivedQuantity = delivery.ReceivedQuantity;
                detail.RejectedQuantity = delivery.ReceivedQuantity - delivery.AcceptedQuantity;

                await unitOfWork.GetRepository<MedicationAndVaccineIntakeDetails>().UpdateAsync(detail);
                totalPrice += delivery.AcceptedQuantity * detail.UnitPrice;

            }

            medVacIntake.TotalPrice = totalPrice;
            medVacIntake.RemainingAmount = totalPrice - medVacIntake.Deposit;

            await unitOfWork.GetRepository<MedicationAndVaccineIntakes>().UpdateAsync(medVacIntake);

            await unitOfWork.SaveAsync();

            return new MedVacDeliveryModel
            {
                MedVacIntakeId = medVacIntakeId,
                TotalPrice = medVacIntake.TotalPrice.Value,
                RemainingAmount = medVacIntake.RemainingAmount.GetValueOrDefault(),
            };
        }


        public Task<BasePagination<MedVacIntakeResponseModel>> GetMedVacIntake(DateTimeOffset? date, string? supplierId, string? statusManager, string? inStock, string? id, int pageIndex, int pageSize)
        {
            throw new NotImplementedException();
        }

        public async Task UpdateQuantityForMedVac(string medVacIntakeId)
        {
            MedicationAndVaccineIntakes? medVacInTake = await unitOfWork.GetRepository<MedicationAndVaccineIntakes>().GetByIdAsync(medVacIntakeId)
                   ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phiếu nhập thuốc không tồn tại");

            if (medVacInTake.ApprovedTime == null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Phiếu nhập thuốc chưa được chấp thuận");
            }

            if (!medVacInTake.DeliveryDate.HasValue)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Phiếu nhập thuốc chưa được giao");
            }
            if (medVacInTake.IsInStock.HasValue)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Phiếu nhập thuốc đã được chuyển vào kho");
            }

            List<MedicationAndVaccineIntakeDetails> details = await unitOfWork.GetRepository<MedicationAndVaccineIntakeDetails>()
                .GetEntities
                .Where(d => d.MedVacIntakeId == medVacIntakeId)
                .ToListAsync();

            foreach (MedicationAndVaccineIntakeDetails detail in details)
            {
                MedicationAndVaccines? medVac = await unitOfWork.GetRepository<MedicationAndVaccines>().GetByIdAsync(detail.MedVacId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thuốc không tồn tại");
                if (detail.AcceptedQuantity <= 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Lỗi hệ thống!");
                }
                else
                {
                    medVac.Quantity += detail.AcceptedQuantity.GetValueOrDefault();
                    await unitOfWork.GetRepository<MedicationAndVaccines>().UpdateAsync(medVac);
                }

            }
            medVacInTake.IsInStock = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<MedicationAndVaccineIntakes>().UpdateAsync(medVacInTake);

            await unitOfWork.SaveAsync();
        }



    }
}