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
                    TotalPrice = x.TotalPrice ?? 0,
                    RemainingAmount = x.RemainingAmount ?? 0,
                    ExpectedQuantity = x.ExpectedQuantity,
                    ReceivedQuantity = x.ReceivedQuantity.GetValueOrDefault(),
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

            // Gửi email cho người cung cấp
            string emailBody = $@"
                <html>
                <head>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #2c3e50;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f8f9fa;
                        }}
                        .header {{
                            text-align: center;
                            margin-bottom: 35px;
                            padding: 25px;
                            background: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }}
                        .title {{
                            color: #2c3e50;
                            font-size: 28px;
                            font-weight: bold;
                            margin-bottom: 15px;
                            letter-spacing: 1px;
                        }}
                        .document-id {{
                            font-size: 16px;
                            color: #5a6268;
                            font-weight: 500;
                        }}
                        .content {{
                            background: #ffffff;
                            padding: 35px;
                            border-radius: 10px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                            margin-bottom: 25px;
                        }}
                        .section {{
                            margin-bottom: 30px;
                        }}
                        .section-title {{
                            font-weight: bold;
                            color: #2c3e50;
                            border-bottom: 2px solid #3498db;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                            font-size: 20px;
                        }}
                        .details-grid {{
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 20px;
                            margin-bottom: 15px;
                        }}
                        .details-item {{
                            padding: 15px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            border: 1px solid #e9ecef;
                            transition: all 0.3s ease;
                        }}
                        .details-item:hover {{
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }}
                        .details-label {{
                            color: #5a6268;
                            font-size: 14px;
                            margin-bottom: 5px;
                            font-weight: 500;
                        }}
                        .details-value {{
                            font-weight: 600;
                            color: #2c3e50;
                            font-size: 16px;
                        }}
                        .note-section {{
                            padding: 20px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            border-left: 4px solid #3498db;
                            margin: 25px 0;
                        }}
                        .footer {{
                            text-align: center;
                            padding: 25px;
                            background: #ffffff;
                            border-radius: 10px;
                            margin-top: 35px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }}
                        .company-info {{
                            margin-top: 25px;
                            padding-top: 25px;
                            border-top: 1px solid #e9ecef;
                            text-align: center;
                            font-size: 14px;
                            color: #5a6268;
                            line-height: 1.8;
                        }}
                        .greeting {{
                            font-size: 16px;
                            color: #2c3e50;
                            line-height: 1.8;
                            margin-bottom: 25px;
                            padding: 0 15px;
                        }}
                    </style>
                </head>
                <body>
                    <div class='header'>
                        <div class='title'>PHIẾU XÁC NHẬN ĐƠN HÀNG</div>
                        <div class='document-id'>Mã đơn hàng: {pigIntake.Id}</div>
                    </div>

                    <div class='content'>
                        <div class='greeting'>
                            Kính gửi Quý đối tác,<br><br>
                            Trang trại chăn nuôi NTNPIGFARM xin trân trọng thông báo đơn đặt hàng của chúng tôi đến Quý đối tác. Chúng tôi rất mong nhận được sự phản hồi sớm từ phía Quý đối tác.<br><br>
                            Địa chỉ: Số 2, đường N1, khu dân cư phục vụ tái định cư, khu phố Nhị Hòa,<br>
                            phường Hiệp Hòa, thành phố Biên Hòa, tỉnh Đồng Nai<br>
                            Điện thoại: 0971.758.902<br>
                            Email: truongtamcobra@gmail.com<br><br>
                            Chúng tôi rất vinh dự được phục vụ và cảm ơn sự tin tưởng của Quý đối tác.
                        </div>

                        <div class='section'>
                            <div class='section-title'>Thông Tin Đơn Hàng</div>
                            <div class='details-grid'>
                                <div class='details-item'>
                                    <div class='details-label'>Ngày Lập Phiếu</div>
                                    <div class='details-value'>{DateTimeOffset.Now:dd/MM/yyyy}</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Trạng Thái</div>
                                    <div class='details-value'>Đã Xác Nhận</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Ngày Dự Kiến Giao Hàng</div>
                                    <div class='details-value'>{pigIntake.ExpectedReceiveDate:dd/MM/yyyy}</div>
                                </div>
                            </div>
                        </div>

                        <div class='section'>
                            <div class='section-title'>Chi Tiết Đơn Hàng</div>
                            <div class='details-grid'>
                                <div class='details-item'>
                                    <div class='details-label'>Số Lượng Heo Giống</div>
                                    <div class='details-value'>{pigIntake.ExpectedQuantity:N0} con</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Đơn Giá</div>
                                    <div class='details-value'>{pigIntake.UnitPrice:N0} VNĐ/con</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Tiền Đặt Cọc</div>
                                    <div class='details-value'>{pigIntake.Deposit:N0} VNĐ</div>
                                </div>
                                <div class='details-item'>
                                    <div class='details-label'>Tổng Giá Trị Đơn Hàng</div>
                                    <div class='details-value'>{pigIntake.ExpectedQuantity * pigIntake.UnitPrice:N0} VNĐ</div>
                                </div>
                            </div>
                        </div>

                        <div class='note-section'>
                            <div class='section-title'>Điều Khoản và Lưu Ý</div>
                            <p style='color: #2c3e50; line-height: 1.8;'>
                                Kính đề nghị Quý đối tác kiểm tra kỹ các thông tin chi tiết được nêu trong phiếu xác nhận này. 
                                Trong trường hợp cần điều chỉnh hoặc làm rõ bất kỳ thông tin nào, xin vui lòng liên hệ với 
                                chúng tôi theo thông tin được cung cấp bên dưới.<br><br>
                                Chúng tôi cam kết sẽ đảm bảo chất lượng dịch vụ tốt nhất và mong muốn tiếp tục nhận được sự 
                                hợp tác từ Quý đối tác.
                            </p>
                        </div>
                    </div>

                    <div class='footer'>
                        <p>Đây là email tự động từ hệ thống Pig Management.<br>
                        Vui lòng không phản hồi email này.</p>
                    </div>

                    <div class='company-info'>
                        <p><strong>TRANG TRẠI CHĂN NUÔI NTNPIGFARM</strong></p>
                        <p>Địa chỉ: Số 2, đường N1, khu dân cư phục vụ tái định cư, khu phố Nhị Hòa,<br>
                        phường Hiệp Hòa, thành phố Biên Hòa, tỉnh Đồng Nai</p>
                        <p>Hotline: 0971.758.902 | Email: truongtamcobra@gmail.com</p>
                        <p>© 2024 Pig Management. Bảo lưu mọi quyền.</p>
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