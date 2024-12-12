using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Application.Models.PigStable;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
namespace Application.Services
{
    public class PigIntakeService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, IEmailService emailService) : IPigIntakeService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        private readonly IEmailService emailService = emailService;
        public async Task<List<PigInTakeModelView>> GetAllAsync(int pageIndex, int pageSize, string? filter)
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

            List<PigInTakeModelView>? result = await pigIntakes
                .Select(x => new PigInTakeModelView
                {
                    Id = x.Id,
                    SuppliersId = x.SuppliersId,
                    SuppliersName = x.Suppliers.Name,
                    UnitPrice = x.UnitPrice ?? 0,
                    Deposit = x.Deposit ?? 0,
                    ExpectedQuantity = x.ExpectedQuantity,
                    AcceptedQuantity = x.AcceptedQuantity.GetValueOrDefault(),
                    RejectedQuantity = x.RejectedQuantity.GetValueOrDefault(),
                    ApprovedTime = x.ApprovedTime.GetValueOrDefault(),
                    DeliveryDate = x.DeliveryDate.GetValueOrDefault(),
                    StokeDate = x.StokeDate.GetValueOrDefault(),
                    CreatedTime = x.CreatedTime.GetValueOrDefault(),
                    CreateBy = x.CreateBy,
                    CreateByName = unitOfWork.GetRepository<ApplicationUser>().GetEntities
                        .Where(u => u.Id == x.CreateBy)
                        .Select(u => u.FullName)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return result;
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
            ApplicationUser? user = await unitOfWork.GetRepository<ApplicationUser>().GetByIdAsync(result.CreateBy)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy người tạo");
            result.CreateByName = user.FullName;
            result.SuppliersId = pigIntake.SuppliersId;
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
            pigIntake.DeliveryDate = null;
            pigIntake.ExpectedReceiveDate = model.ExpectedReceiveDate;

            await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(pigIntake);
            await unitOfWork.SaveAsync();
            string emailBody = $@"
                <html>
                <head>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }}
                        .header {{
                            text-align: center;
                            margin-bottom: 30px;
                        }}
                        .title {{
                            color: #1a5f7a;
                            font-size: 24px;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-bottom: 10px;
                        }}
                        .document-id {{
                            font-size: 16px;
                            color: #666;
                        }}
                        .content {{
                            background: #fff;
                            padding: 30px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }}
                        .section {{
                            margin-bottom: 25px;
                        }}
                        .section-title {{
                            font-weight: bold;
                            color: #1a5f7a;
                            border-bottom: 2px solid #1a5f7a;
                            padding-bottom: 5px;
                            margin-bottom: 15px;
                        }}
                        .details-grid {{
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                        }}
                        .details-item {{
                            padding: 8px;
                            background: #f9f9f9;
                            border-radius: 4px;
                        }}
                        .details-label {{
                            color: #666;
                            font-size: 14px;
                        }}
                        .details-value {{
                            font-weight: bold;
                            color: #333;
                            font-size: 16px;
                        }}
                        .footer {{
                            margin-top: 30px;
                            text-align: center;
                            color: #666;
                            font-size: 14px;
                        }}
                        .company-info {{
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            text-align: center;
                            font-size: 12px;
                            color: #999;
                        }}
                    </style>
                </head>
                <body>
                    <div class='header'>
                        <div class='title'>Phiếu Yêu Cầu Nhập Heo</div>
                        <div class='document-id'>Mã phiếu: {pigIntake.Id}</div>
                    </div>
                    
                    <div class='content'>
                        <div class='section'>
                            <div class='section-title'>Thông Tin Chung</div>
                            <div class='details-grid'>
                                <div class='details-item'>
                                    <div class='details-label'>Ngày lập phiếu</div>
                                    <div class='details-value'>{DateTimeOffset.Now:dd/MM/yyyy}</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Trạng thái</div>
                                    <div class='details-value'>Đã phê duyệt</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Ngày dự kiến giao</div>
                                    <div class='details-value'>{pigIntake.ExpectedReceiveDate:dd/MM/yyyy}</div>
                                </div>
                            </div>
                        </div>

                        <div class='section'>
                            <div class='section-title'>Chi Tiết Đơn Hàng</div>
                            <div class='details-grid'>
                                <div class='details-item'>
                                    <div class='details-label'>Số lượng dự kiến</div>
                                    <div class='details-value'>{pigIntake.ExpectedQuantity:N0} con</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Đơn giá</div>
                                    <div class='details-value'>{pigIntake.UnitPrice:N0} VNĐ/con</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Tiền cọc</div>
                                    <div class='details-value'>{pigIntake.Deposit:N0} VNĐ</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Tổng tiền</div>
                                    <div class='details-value'>{pigIntake.ExpectedQuantity * pigIntake.UnitPrice:N0} VNĐ</div>
                                </div>
                            </div>
                        </div>

                        <div class='section'>
                            <div class='section-title'>Ghi Chú</div>
                            <p>Vui lòng kiểm tra kỹ thông tin trên phiếu yêu cầu. Nếu có bất kỳ thắc mắc nào, xin vui lòng liên hệ với chúng tôi để được giải đáp.</p>
                        </div>
                    </div>

                    <div class='footer'>
                        <p>Phiếu này được tạo tự động từ hệ thống Pig Management.</p>
                        <p>Vui lòng không trả lời email này.</p>
                    </div>

                    <div class='company-info'>
                        <p>© 2024 Pig Management. All rights reserved.</p>
                        <p>Số 2, đường N1, khu dân cư phục vụ tái định cư, khu phố Nhị Hòa, phường Hiệp Hòa, thành phố Biên Hòa, tỉnh Đồng Nai</p>
                        <p>Hotline: 0971758902 | Email: truongtamcobra@gmail.com</p>
                    </div>
                </body>
                </html>";

            Suppliers? supplier = await unitOfWork.GetRepository<Suppliers>().GetByIdAsync(pigIntake.SuppliersId)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy nhà cung cấp");
            await emailService.SendEmailAsync(
                supplier.Email,
                "Yêu cầu nhập heo",
                emailBody
            );

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


        public async Task<List<GetPigStableModelView>> AllocatePigsToStableAsync(string AreasId, string pigIntakeId)
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

            List<Pigs> pigsList = new();
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

                string pigCode = $"HEO_{PigIntake.DeliveryDate:yyyyMMdd}_{totalExistingPigsCount + i}";

                Pigs newPig = new()
                {
                    Id = pigCode,
                    StableId = currentStable.Id,
                    Status = "alive",
                    NextWeighingDate = PigIntake.DeliveryDate
                };
                pigsList.Add(newPig);

                currentStable.CurrentOccupancy++;
            }
            try
            {
                await unitOfWork.GetRepository<Pigs>().AddRangeAsync(pigsList);
                List<Medicines> medicines = await unitOfWork
                    .GetRepository<Medicines>()
                    .GetEntities
                    .Where(m => m.IsVaccine && m.DaysAfterImport.HasValue)
                    .ToListAsync();

                List<VaccinationPlan> vaccinationPlans = pigsList
                    .SelectMany(pig => medicines.Select(medicine => new VaccinationPlan
                    {
                        PigId = pig.Id,
                        MedicineId = medicine.Id,
                        ScheduledDate = DateTime.UtcNow.AddDays(medicine.DaysAfterImport!.Value),
                        Status = "pending"
                    }))
                    .ToList();

                await unitOfWork.GetRepository<VaccinationPlan>().AddRangeAsync(vaccinationPlans);
                foreach (Stables stable in availableStables.Where(s => s.CurrentOccupancy > 0))
                {
                    await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
                }

                PigIntake.StokeDate = DateTimeOffset.UtcNow;
                await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(PigIntake);

                await unitOfWork.SaveAsync();

                return pigsList.Select(p => new GetPigStableModelView
                {
                    Id = p.Id,
                    StableName = p.Stables.Name,
                    StableId = p.StableId
                }).ToList();
            }
            catch (Exception ex)
            {
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                    "Lỗi khi cập nhật dữ liệu: " + ex.Message);
            }
        }



    }
}