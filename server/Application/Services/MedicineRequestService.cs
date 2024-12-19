using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.DTOs;
using Application.DTOs.MedicineImport;
using Application.Interfaces;
using Application.Models;
using Application.Models.Medicine;
using Application.ViewModels.Medicine;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;


namespace server.Application.Services
{
    public class MedicineRequestService : IMedicineRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;

        public MedicineRequestService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
        }

        private async Task<string> GenerateRequestIdAsync()
        {
            string today = DateTime.UtcNow.ToString("yyyyMMdd");
            string prefix = $"RQM_{today}_";

            var lastRequest = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Where(x => x.ID.StartsWith(prefix))
                .OrderByDescending(x => x.ID)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastRequest != null)
            {
                string lastSequence = lastRequest.ID.Split('_').Last();
                sequence = int.Parse(lastSequence) + 1;
            }

            return $"{prefix}{sequence:D3}";
        }

        public async Task CreateRequest(CreateMedicineRequestDTO dto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Validate input
                if (dto.Details == null || !dto.Details.Any())
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Chi tiết phiếu đề xuất không được trống");

                // Validate medicines exist
                foreach (var detail in dto.Details)
                {
                    var medicine = await _unitOfWork.GetRepository<Medicines>()
                        .GetEntities
                        .Include(m => m.MedicineSuppliers)
                        .FirstOrDefaultAsync(m => m.Id == detail.MedicineId && m.IsActive)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            $"Thuốc không tồn tại hoặc không còn hoạt động");
                }

                // Check duplicates
                var duplicateMedicine = dto.Details
                    .GroupBy(x => x.MedicineId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .FirstOrDefault();

                if (duplicateMedicine != null)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        "Không được chọn trùng thuốc trong một phiếu");

                string userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                        "Người dùng chưa đăng nhập");

                string requestId = await GenerateRequestIdAsync();

                RequestMedicine request = new()
                {
                    ID = requestId,
                    RequestBy = userId,
                    RequestDate = DateTimeOffset.UtcNow,
                    Note = dto.Note,
                    Status = RequestStatus.Pending
                };

                await _unitOfWork.GetRepository<RequestMedicine>().InsertAsync(request);

                List<RequestMedicineDetail>? details = dto.Details.Select(d => new RequestMedicineDetail
                {
                    RequestMedicineId = requestId,
                    MedicineId = d.MedicineId,
                    Quantity = d.Quantity,
                    Note = d.Note
                }).ToList();

                await _unitOfWork.GetRepository<RequestMedicineDetail>().AddRangeAsync(details);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();


            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi tạo phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<RequestMedicineModelView> GetRequestById(string id)
        {
            RequestMedicine? request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(x => x.Details)
                    .ThenInclude(x => x.Medicines)
                .FirstOrDefaultAsync(x => x.ID == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu yêu cầu");

            return new RequestMedicineModelView
            {
                Id = request.ID,
                Status = request.Status.ToString(),
                Note = request.Note,
                CreatedBy = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.RequestBy)?.FullName,
                CreatedById = request.RequestBy,
                CreatedTime = request.RequestDate,
                Details = request.Details.Select(d => new RequestMedicineDetailModelView
                {
                    MedicineId = d.MedicineId,
                    MedicineName = d.Medicines.MedicineName,
                    IsVaccine = d.Medicines.IsVaccine,
                    Unit = d.Medicines.Unit,
                    Quantity = (double)d.Quantity,
                    Note = d.Note,
                    Medicine = new MedicineModelView
                    {
                        Id = d.Medicines.Id,
                        MedicineName = d.Medicines.MedicineName,
                        Unit = d.Medicines.Unit,
                        DaysAfterImport = d.Medicines.DaysAfterImport,
                        IsVaccine = d.Medicines.IsVaccine,
                        Description = d.Medicines.Description,
                        QuantityInStock = d.Medicines.QuantityInStock,
                        Suppliers = d.Medicines.MedicineSuppliers.Select(ms => new SupplierModelView
                        {
                            Id = ms.SupplierId,
                            Name = ms.Suppliers.Name
                        }).ToList()
                    }
                }).ToList()
            };
        }

        public async Task<List<RequestMedicineModelView>> GetRequests()
        {
            List<RequestMedicine>? requests = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(x => x.Details)
                    .ThenInclude(x => x.Medicines)
                .OrderByDescending(x => x.RequestDate)
                .ToListAsync();

            return requests.Select(request => new RequestMedicineModelView
            {
                Id = request.ID,
                Status = request.Status.ToString(),
                Note = request.Note,
                CreatedBy = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.RequestBy)?.FullName,
                CreatedById = request.RequestBy,
                CreatedTime = request.RequestDate,
                Details = request.Details.Select(d => new RequestMedicineDetailModelView
                {
                    MedicineId = d.MedicineId,
                    MedicineName = d.Medicines.MedicineName,
                    IsVaccine = d.Medicines.IsVaccine,
                    Unit = d.Medicines.Unit,
                    Quantity = (double)d.Quantity,
                    Note = d.Note,
                    Status = d.Status.ToString(),
                    Medicine = new MedicineModelView
                    {
                        Id = d.Medicines.Id,
                        MedicineName = d.Medicines.MedicineName,
                        Unit = d.Medicines.Unit,
                        DaysAfterImport = d.Medicines.DaysAfterImport,
                        IsVaccine = d.Medicines.IsVaccine,
                        Description = d.Medicines.Description,
                        QuantityInStock = d.Medicines.QuantityInStock,
                        Suppliers = d.Medicines.MedicineSuppliers.Select(ms => new SupplierModelView
                        {
                            Id = ms.SupplierId,
                            Name = ms.Suppliers.Name
                        }).ToList()
                    }
                }).ToList()
            }).ToList();
        }

        public async Task ApproveRequest(string id, MedicineImportDTO dto)
        {
            RequestMedicine? request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.ID == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu yêu cầu");

            if (request.Status == RequestStatus.Completed)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phiếu yêu cầu đã được chấp nhận");
            }

            if (request.Status == RequestStatus.Rejected)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phiếu yêu cầu đã bị từ chối");
            }

            if (request.Status != RequestStatus.Pending)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Chỉ có thể chấp nhận phiếu đang chờ duyệt");
            }
            if (dto.Rejects != null && dto.Rejects.Any())
            {
                foreach (MedicineRejectDTO reject in dto.Rejects)
                {
                    RequestMedicineDetail? detail = request.Details.FirstOrDefault(x => x.MedicineId == reject.MedicineId)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            "Không tìm thấy chi tiết thuốc trong phiếu yêu cầu");
                    detail.Status = RequestStatus.Rejected;
                    detail.Note = reject.Reason;
                    await _unitOfWork.GetRepository<RequestMedicineDetail>().UpdateAsync(detail);
                }
            }

            if (dto.Accepts != null && dto.Accepts.Any())
            {
                foreach (MedicineImportAcceptDTO accept in dto.Accepts)
                {
                    List<string>? medicines = accept.Details.Select(x => x.MedicineId).ToList();
                    foreach (string medicineId in medicines)
                    {
                        RequestMedicineDetail? detail = request.Details.FirstOrDefault(x => x.MedicineId == medicineId)
                            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                                "Không tìm thấy chi tiết thuốc trong phiếu yêu cầu");
                        detail.Status = RequestStatus.Completed;
                        detail.Note = "Chấp nhận yêu cầu";
                        await _unitOfWork.GetRepository<RequestMedicineDetail>().UpdateAsync(detail);
                    }
                    string currentDate = DateTime.Now.ToString("yyyyMMdd");
                    string prefix = $"MEDICINE-{currentDate}-";

                    MedicineImport? lastImport = await _unitOfWork.GetRepository<MedicineImport>()
                        .GetEntities
                        .Where(x => x.Id.StartsWith(prefix))
                        .OrderByDescending(x => x.Id)
                        .FirstOrDefaultAsync();

                    int sequence = 1;
                    if (lastImport != null)
                    {
                        string lastSequence = lastImport.Id.Split('-').Last();
                        if (int.TryParse(lastSequence, out int lastNumber))
                        {
                            sequence = lastNumber + 1;
                        }
                    }

                    string medicineImportId = $"{prefix}{sequence:D3}";

                    MedicineImport medicineImport = new()
                    {
                        Id = medicineImportId,
                        ExpectedDeliveryTime = accept.ExpectedDeliveryTime,
                        Deposit = accept.Deposit,
                        SupplierId = accept.SupplierId,
                        Status = ImportStatus.Pending,
                        CreatedBy = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                                "Người dùng chưa đăng nhập"),
                        Receiver = request.RequestBy,
                        MedicineImportDetails = accept.Details.Select(d => new MedicineImportDetail
                        {
                            MedicineId = d.MedicineId,
                            ExpectedQuantity = d.ExpectedQuantity,
                            Price = d.UnitPrice,
                            MedicineImportId = medicineImportId
                        }).ToList()
                    };
                    await _unitOfWork.GetRepository<MedicineImport>().InsertAsync(medicineImport);
                    await _unitOfWork.SaveAsync();

                    Suppliers? supplier = await _unitOfWork.GetRepository<Suppliers>()
                        .GetEntities
                        .FirstOrDefaultAsync(s => s.Id == accept.SupplierId);

                    if (supplier?.Email != null)
                    {
                        string emailBody = $@"
                        <!DOCTYPE html>
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
                                    padding: 20px 0;
                                    border-bottom: 2px solid #2c3e50;
                                    margin-bottom: 30px;
                                }}
                                .logo {{
                                    font-size: 24px;
                                    font-weight: bold;
                                    color: #2c3e50;
                                    margin-bottom: 10px;
                                }}
                                .order-info {{
                                    background-color: #f8f9fa;
                                    padding: 20px;
                                    border-radius: 5px;
                                    margin-bottom: 30px;
                                }}
                                .order-details {{
                                    margin-bottom: 30px;
                                }}
                                table {{
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin-top: 20px;
                                }}
                                th {{
                                    background-color: #2c3e50;
                                    color: white;
                                    padding: 12px;
                                    text-align: left;
                                }}
                                td {{
                                    padding: 12px;
                                    border-bottom: 1px solid #ddd;
                                }}
                                .total-row {{
                                    background-color: #f8f9fa;
                                    font-weight: bold;
                                }}
                                .footer {{
                                    margin-top: 40px;
                                    padding-top: 20px;
                                    border-top: 1px solid #ddd;
                                    text-align: center;
                                    font-size: 14px;
                                    color: #666;
                                }}
                                .highlight {{
                                    color: #e74c3c;
                                    font-weight: bold;
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='header'>
                                <h2>PHIẾU XÁC NHẬN ĐƠN HÀNG THUỐC</h2>
                            </div>

                            <div class='order-info'>
                                <h3>Kính gửi: Quý đối tác {supplier.Name},</h3>
                                <p style='margin: 20px 0; line-height: 1.8;'>
                                    Căn cứ theo nhu cầu của trang trại và thỏa thuận giữa hai bên, NTNPIGFARM xin gửi đến Quý đối tác 
                                    phiếu xác nhận đơn hàng thuốc thú y với các nội dung chi tiết như sau:
                                </p>
                                
                                <div style='background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                                    <h4 style='margin-bottom: 15px; color: #2c3e50;'>THÔNG TIN ĐƠN HÀNG</h4>
                                    <p><strong>Mã đơn hàng:</strong> #{medicineImportId}</p>
                                    <p><strong>Ngày xác nhận:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</p>
                                    <p><strong>Ngày giao hàng dự kiến:</strong> {accept.ExpectedDeliveryTime:dd/MM/yyyy}</p>
                                    
                                    <h4 style='margin: 20px 0 15px 0; color: #2c3e50;'>THÔNG TIN NHÀ CUNG CẤP</h4>
                                    <p><strong>Đơn vị cung cấp:</strong> {supplier.Name}</p>
                                    <p><strong>Địa chỉ:</strong> {supplier.Address}</p>
                                    <p><strong>Điện thoại:</strong> {supplier.Phone}</p>
                                    <p><strong>Email:</strong> {supplier.Email}</p>
                                </div>
                            </div>

                            <div class='order-details'>
                                <h3>CHI TIẾT ĐƠN HÀNG ĐÃ THỐNG NHẤT</h3>
                                <table>
                                    <tr>
                                        <th style='width: 40%; text-align: left;'>Tên Thuốc</th>
                                        <th style='width: 20%; text-align: right;'>Số Lượng</th>
                                        <th style='width: 20%; text-align: right;'>Đơn Giá</th>
                                        <th style='width: 20%; text-align: right;'>Thành Tiền</th>
                                    </tr>";

                        decimal total = 0;
                        foreach (var detail in accept.Details)
                        {
                            var medicine = await _unitOfWork.GetRepository<Medicines>()
                                .GetEntities
                                .FirstOrDefaultAsync(m => m.Id == detail.MedicineId);

                            decimal amount = detail.ExpectedQuantity * detail.UnitPrice;
                            total += amount;

                            emailBody += $@"
                                    <tr>
                                        <td style='text-align: left;'>{medicine?.MedicineName}</td>
                                        <td style='text-align: right;'>{detail.ExpectedQuantity:N0}</td>
                                        <td style='text-align: right;'>{detail.UnitPrice:N0} VNĐ</td>
                                        <td style='text-align: right;'>{amount:N0} VNĐ</td>
                                    </tr>";
                        }

                        emailBody += $@"
                                    <tr class='total-row'>
                                        <td colspan='3' style='text-align: right; padding-right: 20px;'><strong>Tổng Giá Trị Đơn Hàng:</strong></td>
                                        <td style='text-align: right;'><strong>{total:N0} VNĐ</strong></td>
                                    </tr>
                                    <tr class='total-row'>
                                        <td colspan='3' style='text-align: right; padding-right: 20px;'><strong>Tiền Đặt Cọc (Đã Thỏa Thuận):</strong></td>
                                        <td style='text-align: right;'><span class='highlight'>{accept.Deposit:N0} VNĐ</span></td>
                                    </tr>
                                    <tr class='total-row'>
                                        <td colspan='3' style='text-align: right; padding-right: 20px;'><strong>Số Tiền Còn Lại:</strong></td>
                                        <td style='text-align: right;'><strong>{(total - accept.Deposit):N0} VNĐ</strong></td>
                                    </tr>
                                </table>
                            </div>

                            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                                <p style='margin-bottom: 15px;'><strong>Điều khoản và lưu ý quan trọng:</strong></p>
                                <ul style='list-style: none; padding-left: 20px; line-height: 1.8;'>
                                    <li>1. Đề nghị Quý đối tác giao hàng đúng thời gian và địa điểm đã thỏa thuận</li>
                                    <li>2. Thuốc thú y phải đảm bảo chất lượng, nguồn gốc xuất xứ rõ ràng</li>
                                    <li>3. Hạn sử dụng của thuốc phải còn tối thiểu 12 tháng kể từ ngày giao hàng</li>
                                    <li>4. Mọi thay đổi về số lượng hoặc thời gian giao hàng vui lòng thông báo trước 24h</li>
                                    <li>5. Đơn hàng có hiệu lực kể từ thời điểm gửi email này</li>
                                </ul>
                            </div>

                            <div class='footer'>
                                <p style='margin-bottom: 15px;'>Trân trọng cảm ơn sự hợp tác của Quý đối tác.</p>
                                <strong>TRANG TRẠI CHĂN NUÔI NTNPIGFARM</strong><br>
                                Địa chỉ: Số 2, đường N1, KDC Nhị Hòa, P.Hiệp Hòa, TP.Biên Hòa, Đồng Nai<br>
                                Hotline: 0971.758.902 | Email: truongtamcobra@gmail.com<br>
                                <p style='margin-top: 15px; font-size: 12px; color: #666;'>
                                    Đây là email tự động - Vui lòng không phản hồi lại email này.<br>
                                    © {DateTime.Now.Year} NTNPIGFARM. All rights reserved.
                                </p>
                            </div>
                        </body>
                        </html>";

                        await _emailService.SendEmailAsync(
                            supplier.Email,
                            $"Đơn đặt thuốc mới #{medicineImportId}",
                            emailBody
                        );
                    }
                }
            }

            request.Status = RequestStatus.Completed;
            await _unitOfWork.SaveAsync();
        }

        public async Task RejectRequest(string id, string reason)
        {
            RequestMedicine? request = await _unitOfWork.GetRepository<RequestMedicine>()
                .GetEntities
                .FirstOrDefaultAsync(x => x.ID == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu yêu cầu");

            if (request.Status == RequestStatus.Completed)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Không thể từ chối phiếu đã hoàn thành hoặc đang xử lý");
            }

            if (request.Status != RequestStatus.Pending)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Chỉ có thể từ chối phiếu đang chờ duyệt");
            }

            request.Status = RequestStatus.Rejected;
            // request.RejectReason = reason;
            await _unitOfWork.SaveAsync();
        }
    }
}