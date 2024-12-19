using System.Security.Claims;
using Application.DTOs.FoodImportRequest;
using Application.Interfaces;
using Application.Models.FoodImportRequestModelView;
using Application.Models.FoodModelView;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class FoodImportRequestService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor,
        IEmailService emailService
        ) : IFoodImportRequestService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly IEmailService _emailService = emailService;

        private async Task<string> GenerateRequestIdAsync()
        {
            string today = DateTime.UtcNow.ToString("yyyyMMdd");
            string prefix = $"RQF_{today}_";

            // Lấy số phiếu đề xuất trong ngày
            var lastRequest = await _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Where(x => x.Id.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastRequest != null)
            {
                // Lấy số sequence từ ID cuối cùng
                string lastSequence = lastRequest.Id.Split('_').Last();
                sequence = int.Parse(lastSequence) + 1;
            }

            return $"{prefix}{sequence:D3}"; // Format số sequence thành 3 chữ số
        }

        public async Task<FoodImportRequestModelView> CreateRequestAsync(CreateFoodImportRequestDto dto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Validate input
                if (dto.Details == null || dto.Details.Count == 0)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Chi tiết phiếu đề xuất không được trống");

                // 2. Validate food items exist
                foreach (var detail in dto.Details)
                {
                    var food = await _unitOfWork.GetRepository<Foods>().GetByIdAsync(detail.FoodId)
                        ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy thức ăn với ID: {detail.FoodId}");
                }

                // 3. Check duplicate food items
                var duplicateFood = dto.Details
                    .GroupBy(x => x.FoodId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .FirstOrDefault();
                if (duplicateFood != null)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không được chọn trùng thức ăn trong một phiếu");

                string userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Người dùng chưa đăng nhập");

                // Generate ID theo format
                string requestId = await GenerateRequestIdAsync();

                FoodImportRequests? request = new FoodImportRequests
                {
                    Id = requestId, // Gán ID đã generate
                    CreatedById = userId,
                    CreatedBy = userId,
                    Note = dto.Note,
                    Status = "pending",
                    CreatedTime = DateTimeOffset.UtcNow,
                    FoodImportRequestDetails = dto.Details.Select(d => new FoodImportRequestDetails
                    {
                        FoodId = d.FoodId,
                        FoodImportRequestId = requestId,
                        ExpectedQuantity = d.ExpectedQuantity
                    }).ToList()
                };

                await _unitOfWork.GetRepository<FoodImportRequests>().InsertAsync(request);
                await _unitOfWork.SaveAsync();
                // await _notificationService.NotifyRequestCreatedAsync(request.Id);

                await transaction.CommitAsync();
                return await GetRequestByIdAsync(request.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi tạo phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<FoodImportRequestModelView> UpdateRequestAsync(string id, UpdateFoodImportRequestDto dto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {


                // 1. Validate request exists and status
                FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                    .GetEntities
                    .Include(x => x.FoodImportRequestDetails)
                    .FirstOrDefaultAsync(x => x.Id == id)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy phiếu đề xuất");
                if (request.Status != "pending")
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Chỉ có thể cập nhật phiếu đề xuất ở trạng thái chờ duyệt");

                // 2. Validate food items exist
                foreach (UpdateFoodImportRequestDetailDto detail in dto.Details)
                {
                    Foods? food = await _unitOfWork.GetRepository<Foods>().GetByIdAsync(detail.FoodId)
                    ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, $"Không tìm thấy thức ăn với ID: {detail.FoodId}");
                }

                // 3. Check duplicate food items
                string? duplicateFood = dto.Details
                    .GroupBy(x => x.FoodId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .FirstOrDefault();
                if (duplicateFood != null)
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không được chọn trùng thức ăn trong một phiếu");

                IGenericRepository<FoodImportRequestDetails>? detailRepository = _unitOfWork.GetRepository<FoodImportRequestDetails>();
                List<FoodImportRequestDetails>? currentDetails = request.FoodImportRequestDetails.ToList();

                // 1. Xóa những detail không còn trong danh sách mới
                List<string>? newFoodIds = dto.Details.Select(d => d.FoodId).ToList();
                IEnumerable<FoodImportRequestDetails>? detailsToDelete = currentDetails.Where(d => !newFoodIds.Contains(d.FoodId));
                foreach (FoodImportRequestDetails detail in detailsToDelete)
                {
                    await detailRepository.DeleteAsync(detail);
                }

                // 2. Cập nhật hoặc thêm mới
                foreach (UpdateFoodImportRequestDetailDto newDetail in dto.Details)
                {
                    FoodImportRequestDetails? existingDetail = currentDetails.FirstOrDefault(d => d.FoodId == newDetail.FoodId);
                    if (existingDetail != null)
                    {
                        // Cập nhật detail đã tồn tại
                        existingDetail.ExpectedQuantity = newDetail.ExpectedQuantity;
                        await detailRepository.UpdateAsync(existingDetail);
                    }
                    else
                    {
                        // Thêm detail mới
                        FoodImportRequestDetails? detail = new FoodImportRequestDetails
                        {
                            FoodImportRequestId = id,
                            FoodId = newDetail.FoodId,
                            ExpectedQuantity = newDetail.ExpectedQuantity
                        };
                        await detailRepository.InsertAsync(detail);
                    }
                }

                // 3. Cập nhật thông tin cơ bản của request
                request.Note = dto.Note;
                await _unitOfWork.SaveAsync();

                await transaction.CommitAsync();
                return await GetRequestByIdAsync(id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Lỗi khi cập nhật phiếu đề xuất: " + ex.Message);
            }
        }

        public async Task<FoodImportRequestModelView> ApproveRequestAsync(string id, FoodImportRequestDTO dto)
        {
            FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Include(x => x.FoodImportRequestDetails)
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu đề xuất");

            if (request.Status == "completed")
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phiếu đề xuất đã được duyệt");
            }

            if (request.Status != "pending")
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Chỉ có thể chấp nhận phiếu đang chờ duyệt");
            }

            if (dto.Rejects != null && dto.Rejects.Any())
            {
                foreach (FoodRejectDTO reject in dto.Rejects)
                {
                    FoodImportRequestDetails? detail = request.FoodImportRequestDetails.FirstOrDefault(x => x.FoodId == reject.FoodId)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            "Không tìm thấy chi tiết thực phẩm trong phiếu đề xuất");
                    detail.Status = "rejected";
                    detail.Note = reject.Reason;
                    await _unitOfWork.GetRepository<FoodImportRequestDetails>().UpdateAsync(detail);
                }
            }

            if (dto.Accepts != null && dto.Accepts.Any())
            {
                foreach (FoodImportAcceptDTO accept in dto.Accepts)
                {
                    List<string>? foods = accept.Details.Select(x => x.FoodId).ToList();
                    foreach (string foodId in foods)
                    {
                        FoodImportRequestDetails? detail = request.FoodImportRequestDetails.FirstOrDefault(x => x.FoodId == foodId)
                            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                                "Không tìm thấy chi tiết thực phẩm trong phiếu đề xuất");
                        detail.Status = "completed";
                        detail.Note = "Chấp nhận yêu cầu";
                        await _unitOfWork.GetRepository<FoodImportRequestDetails>().UpdateAsync(detail);
                    }

                    string prefix = $"FIP_{DateTime.UtcNow:yyyyMMdd}";
                    int sequence = await _unitOfWork.GetRepository<FoodImports>()
                        .GetEntities
                        .CountAsync(x => x.Id.StartsWith(prefix)) + 1;
                    string foodImportId = $"{prefix}_{sequence:D4}";

                    FoodImports foodImport = new()
                    {
                        Id = foodImportId,
                        ExpectedDeliveryTime = accept.ExpectedDeliveryTime,
                        DepositAmount = accept.Deposit,
                        SupplierId = accept.SupplierId,
                        Receiver = request.CreatedBy,
                        Status = "pending",
                        CreatedById = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized,
                                "Người dùng chưa đăng nhập"),
                        FoodImportDetails = accept.Details.Select(d => new FoodImportDetails
                        {
                            FoodId = d.FoodId,
                            ExpectedQuantity = d.ExpectedQuantity,
                            UnitPrice = d.UnitPrice,
                            FoodImportId = foodImportId,
                        }).ToList()
                    };
                    await _unitOfWork.GetRepository<FoodImports>().InsertAsync(foodImport);
                    await _unitOfWork.SaveAsync();

                    // Get supplier email
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
                                <h2>PHIẾU ĐẶT HÀNG THỨC ĂN CHĂN NUÔI</h2>
                            </div>

                            <div class='order-info'>
                                <h3>Kính gửi: Quý đối tác {supplier.Name},</h3>
                                <p style='margin: 20px 0; line-height: 1.8;'>
                                    Căn cứ theo nhu cầu của trang trại và thỏa thuận giữa hai bên, NTNPIGFARM xin gửi đến Quý đối tác 
                                    đơn đặt hàng với các nội dung chi tiết như sau:
                                </p>
                                
                                <div style='background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
                                    <h4 style='margin-bottom: 15px; color: #2c3e50;'>THÔNG TIN ĐƠN HÀNG</h4>
                                    <p><strong>Mã đơn hàng:</strong> #{foodImportId}</p>
                                    <p><strong>Ngày đặt hàng:</strong> {DateTime.Now:dd/MM/yyyy HH:mm}</p>
                                    <p><strong>Ngày giao hàng dự kiến:</strong> {accept.ExpectedDeliveryTime:dd/MM/yyyy}</p>
                                    
                                    <h4 style='margin: 20px 0 15px 0; color: #2c3e50;'>THÔNG TIN NHÀ CUNG CẤP</h4>
                                    <p><strong>Đơn vị cung cấp:</strong> {supplier.Name}</p>
                                    <p><strong>Địa chỉ:</strong> {supplier.Address}</p>
                                    <p><strong>Điện thoại:</strong> {supplier.Phone}</p>
                                    <p><strong>Email:</strong> {supplier.Email}</p>
                                </div>
                            </div>

                            <div class='order-details'>
                                <h3>CHI TIẾT ĐƠN HÀNG</h3>
                                <table>
                                    <tr>
                                        <th style='width: 40%; text-align: left;'>Tên Sản Phẩm</th>
                                        <th style='width: 20%; text-align: right;'>Số Lượng</th>
                                        <th style='width: 20%; text-align: right;'>Đơn Giá</th>
                                        <th style='width: 20%; text-align: right;'>Thành Tiền</th>
                                    </tr>";

                        decimal total = 0;
                        foreach (var detail in accept.Details)
                        {
                            var food = await _unitOfWork.GetRepository<Foods>()
                                .GetEntities
                                .FirstOrDefaultAsync(f => f.Id == detail.FoodId);

                            decimal amount = detail.ExpectedQuantity * detail.UnitPrice;
                            total += amount;

                            emailBody += $@"
                                    <tr>
                                        <td style='text-align: left;'>{food?.Name}</td>
                                        <td style='text-align: right;'>{detail.ExpectedQuantity:N0} kg</td>
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
                                <p style='margin-bottom: 15px;'><strong>Điều khoản và lưu ý:</strong></p>
                                <ul style='list-style: none; padding-left: 20px; line-height: 1.8;'>
                                    <li>1. Đề nghị Quý đối tác giao hàng đúng thời gian và địa điểm đã thỏa thuận</li>
                                    <li>2. Chất lượng hàng hóa phải đảm bảo theo tiêu chuẩn đã thống nhất</li>
                                    <li>3. Mọi thay đổi về số lượng hoặc thời gian giao hàng vui lòng thông báo trước 24h</li>
                                    <li>4. Đơn hàng có hiệu lực kể từ thời điểm gửi email này</li>
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
                            $"Đơn đặt hàng mới #{foodImportId}",
                            emailBody
                        );
                    }
                }
            }
            request.Status = "completed";
            request.ApprovedTime = DateTimeOffset.UtcNow;
            request.UpdatedTime = DateTimeOffset.UtcNow;

            await _unitOfWork.SaveAsync();
            return await GetRequestByIdAsync(id);
        }

        public async Task<FoodImportRequestModelView> GetRequestByIdAsync(string id)
        {
            FoodImportRequests? request = await _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodTypes)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.Areas)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodSuppliers)
                            .ThenInclude(fs => fs.Suppliers)
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Không tìm thấy phiếu đề xuất");
            FoodImportRequestModelView? result = _mapper.Map<FoodImportRequestModelView>(request);
            // result.CreatedById = request.CreatedById;
            result.CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.CreatedById)?.FullName;
            // result.CreatedTime = request.CreatedTime.GetValueOrDefault();
            return result;
        }

        public async Task<List<FoodImportRequestModelView>> GetRequestsAsync(
            string? search = null,
            string? status = null,
            DateTimeOffset? fromDate = null,
            DateTimeOffset? toDate = null)
        {
            IQueryable<FoodImportRequests> query = _unitOfWork.GetRepository<FoodImportRequests>()
                .GetEntities
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodTypes)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.Areas)
                .Include(x => x.FoodImportRequestDetails)
                    .ThenInclude(d => d.Foods)
                        .ThenInclude(f => f.FoodSuppliers)
                            .ThenInclude(fs => fs.Suppliers)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
                query = query.Where(x => x.Note.Contains(search));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(x => x.Status == status);

            if (fromDate.HasValue)
                query = query.Where(x => x.CreatedTime >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(x => x.CreatedTime <= toDate.Value);

            // Execute query and manually map results
            List<FoodImportRequests>? requests = await query.ToListAsync();

            return requests.Select(r => new FoodImportRequestModelView
            {
                Id = r.Id,
                CreatedById = r.CreatedById,
                CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == r.CreatedById)?.FullName,
                CreatedTime = r.CreatedTime.GetValueOrDefault(),

                Note = r.Note,
                Status = r.Status,
                Details = r.FoodImportRequestDetails.Select(d => new FoodImportRequestDetailModelView
                {
                    Id = d.FoodId,
                    FoodId = d.FoodId,
                    ExpectedQuantity = d.ExpectedQuantity,
                    Food = new FoodDetailModelView
                    {
                        Id = d.Foods.Id,
                        Name = d.Foods.Name,
                        Description = d.Foods.Description,
                        FoodTypeName = d.Foods.FoodTypes?.FoodTypeName,
                        AreaName = d.Foods.Areas?.Name,
                        Suppliers = d.Foods.FoodSuppliers.Select(fs => new FoodSupplierModelView
                        {
                            SupplierId = fs.Suppliers.Id,
                            SupplierName = fs.Suppliers.Name
                        }).ToList()
                    }
                }).ToList()
            }).ToList();
        }

        public async Task DeleteRequestAsync(string id)
        {
            // using var transaction = await _unitOfWork.BeginTransactionAsync();
            // try
            // {
            //     var request = await _unitOfWork.GetRepository<FoodImportRequests>()
            //         .GetEntities
            //         .Include(x => x.FoodImportRequestDetails)
            //         .Include(x => x.FoodImports)
            //         .FirstOrDefaultAsync(x => x.Id == id)
            //         ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
            //             "Không tìm thấy phiếu đề xuất");

            //     if (request.Status != "pending")
            //         throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
            //             "Chỉ có thể xóa phiếu đề xuất ở trạng thái chờ duyệt");

            //     if (request.FoodImports.Any())
            //         throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
            //             "Không thể xóa phiếu đề xuất đã có phiếu nhập");

            //     request.DeleteTime = DateTimeOffset.UtcNow;
            //     await _unitOfWork.SaveAsync();

            //     await transaction.CommitAsync();
            // }
            // catch (Exception ex)
            // {
            //     await transaction.RollbackAsync();
            //     throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
            //         "Lỗi khi xóa phiếu đề xuất: " + ex.Message);
            // }
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                "Không thể xóa phiếu đề xuất");
        }
    }
}