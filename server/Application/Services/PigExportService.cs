using System.Security.Claims;
using Application.DTOs.ExportPig;
using Application.Interfaces;
using Application.Models.PigExport;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class PigExportService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager, IEmailService emailService) : IPigExportService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly IEmailService _emailService = emailService;

        private async Task<string> GenerateExportRequestId()
        {
            string dateStr = DateTime.Now.ToString("yyyyMMdd");

            // Lấy số thứ tự cao nhất trong ngày
            var lastRequest = await _unitOfWork.GetRepository<PigExportRequest>()
                .GetEntities
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastRequest != null)
            {
                string lastDateStr = lastRequest.Id.Substring(5, 8); // Lấy phần ngày từ ID cuối
                string lastSequence = lastRequest.Id.Substring(13); // Lấy 3 số cuối từ vị trí 13

                if (lastDateStr == dateStr) // Nếu cùng ngày
                {
                    sequence = int.Parse(lastSequence) + 1;
                }
                else // Nếu khác ngày
                {
                    sequence = 1;
                }
            }

            return $"PEXRQ{dateStr}{sequence:D3}";
        }

        public async Task<PigExportRequestModelView> CreatePigExportRequest(CreatePigExportRequestDTO dto)
        {
            // Validate input
            if (dto.Details == null || !dto.Details.Any())
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phải có ít nhất một heo trong đề xuất xuất");
            }

            // Kiểm tra trùng lặp PigId
            var pigIds = dto.Details.Select(d => d.PigId).ToList();
            if (pigIds.Count != pigIds.Distinct().Count())
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Không được chọn trùng heo");
            }

            // Kiểm tra và lấy thông tin các heo
            List<Pigs>? pigs = new List<Pigs>();
            foreach (PigExportRequestDetailDTO detail in dto.Details)
            {
                var pig = await _unitOfWork.GetRepository<Pigs>()
                    .GetEntities
                    .Include(p => p.Stables)
                    .FirstOrDefaultAsync(p => p.Id == detail.PigId
                        && p.Status == "alive"
                        && p.DeleteTime == null)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                        $"Không tìm thấy heo {detail.PigId} hoặc heo không thể xuất");

                // Kiểm tra heo đã có trong đề xuất xuất khác chưa
                bool existsInOtherRequest = await _unitOfWork.GetRepository<PigExportRequestDetail>()
                    .GetEntities
                    .AnyAsync(d => d.PigId == detail.PigId
                        && d.PigExportRequest.Status != "rejected");

                if (existsInOtherRequest)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        $"Heo {detail.PigId} đã tồn tại trong đề xuất xuất khác");
                }

                // Validate trọng lượng
                if (detail.CurrentWeight <= 0)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        $"Trọng lượng của heo {detail.PigId} không hợp lệ");
                }

                // Validate health status
                if (!new[] { "good", "bad", "sick" }.Contains(detail.HealthStatus.ToLower()))
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                        $"Tình trạng sức khỏe của heo {detail.PigId} không hợp lệ");
                }

                List<VaccinationPlan>? vaccinations = await _unitOfWork.GetRepository<VaccinationPlan>()
                    .GetEntities
                    .Include(v => v.Medicine)
                    .Where(v => v.PigId == detail.PigId
                        && v.Medicine.IsVaccine
                        && v.DeleteTime == null)
                    .ToListAsync();

                List<string>? pendingVaccines = vaccinations
                    .Where(v => v.Status == "pending")
                    .Select(v => v.Medicine.MedicineName)
                    .ToList();

                if (pendingVaccines.Any())
                {
                    throw new BaseException(
                        StatusCodeHelper.BadRequest,
                        ErrorCode.BadRequest,
                        $"Heo {detail.PigId} chưa được tiêm đầy đủ vaccine: {string.Join(", ", pendingVaccines)}"
                    );
                }
                pigs.Add(pig);
            }

            // Tạo đề xuất xuất với ID mới
            PigExportRequest? request = new PigExportRequest
            {
                Id = await GenerateExportRequestId(),
                CreatedBy = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                RequestDate = DateTimeOffset.UtcNow,
                Status = "pending",
                Details = dto.Details.Select(d => new PigExportRequestDetail
                {
                    PigId = d.PigId,
                    CurrentWeight = d.CurrentWeight,
                    HealthStatus = d.HealthStatus.ToLower(),
                    Status = "pending",
                    Note = d.Note,
                }).ToList()
            };

            await _unitOfWork.GetRepository<PigExportRequest>().InsertAsync(request);
            await _unitOfWork.SaveAsync();

            // Trả về thông tin đầy đủ của đề xuất
            PigExportRequest? result = await _unitOfWork.GetRepository<PigExportRequest>()
                .GetEntities
                .Include(r => r.Details)
                    .ThenInclude(d => d.Pig)
                        .ThenInclude(p => p.Stables)
                .FirstOrDefaultAsync(r => r.Id == request.Id);

            return _mapper.Map<PigExportRequestModelView>(result);
        }

        public async Task<List<PigExportRequestModelView>> GetAllPigExportRequests()
        {
            List<PigExportRequest>? requests = await _unitOfWork.GetRepository<PigExportRequest>()
                .GetEntities
                .Include(r => r.Details)
                    .ThenInclude(d => d.Pig)
                        .ThenInclude(p => p.Stables)
                .Where(r => r.DeleteTime == null)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            List<PigExportRequestModelView> result = _mapper.Map<List<PigExportRequestModelView>>(requests);

            foreach (PigExportRequestModelView request in result)
            {
                ApplicationUser? createdByUser = await _userManager.FindByIdAsync(request.CreatedBy);
                ApplicationUser? approvedByUser = request.ApprovedBy != null
                    ? await _userManager.FindByIdAsync(request.ApprovedBy)
                    : null;

                request.CreatedBy = createdByUser?.Id;
                request.CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.CreatedBy)?.FullName;
                request.ApprovedBy = approvedByUser?.Id;
                request.ApprovedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.ApprovedBy)?.FullName;
            }

            return result;
        }

        public async Task<PigExportRequestModelView> GetPigExportRequestById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Id không được để trống!");
            }

            // Lấy chi tiết đề xuất xuất heo
            PigExportRequest? request = await _unitOfWork.GetRepository<PigExportRequest>()
                .GetEntities
                .Include(r => r.Details)
                    .ThenInclude(d => d.Pig)
                        .ThenInclude(p => p.Stables)
                .FirstOrDefaultAsync(r => r.Id == id && r.DeleteTime == null)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy đề xuất xuất heo");

            // Lấy thông tin người tạo và người duyệt (nếu có)
            ApplicationUser? createdByUser = await _userManager.FindByIdAsync(request.CreatedBy);
            ApplicationUser? approvedByUser = request.ApprovedBy != null
                ? await _userManager.FindByIdAsync(request.ApprovedBy)
                : null;

            PigExportRequestModelView? result = _mapper.Map<PigExportRequestModelView>(request);

            // Bổ sung thông tin người tạo/duyệt
            result.CreatedBy = createdByUser?.UserName;
            result.CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.CreatedBy)?.FullName;
            result.ApprovedBy = approvedByUser?.UserName;
            result.ApprovedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == request.ApprovedBy)?.FullName;

            return result;
        }

        public async Task<PigExportRequestModelView> ApprovePigExportRequest(string id)
        {
            // Lấy đề xuất xuất heo
            PigExportRequest? exportRequest = await _unitOfWork.GetRepository<PigExportRequest>()
                .GetEntities
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.Id == id && x.DeleteTime == null)
                 ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy đề xuất xuất heo");
            if (exportRequest.Status != "pending")
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Đề xuất này không ở trạng thái chờ duyệt");

            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Cập nhật trạng thái đề xuất
                exportRequest.Status = "approved";
                exportRequest.ApprovalDate = DateTimeOffset.Now;
                exportRequest.ApprovedBy = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                // Cập nhật chi tiết đề xuất
                foreach (PigExportRequestDetail detail in exportRequest.Details)
                {
                    detail.Status = "approved";
                }

                // Lấy danh sách heo cần cập nhật
                List<string>? pigIds = exportRequest.Details.Select(x => x.PigId).ToList();
                List<Pigs>? pigs = await _unitOfWork.GetRepository<Pigs>()
                    .GetEntities
                    .Where(x => pigIds.Contains(x.Id))
                    .ToListAsync();

                // Cập nhật trạng thái heo thành pending (chờ xuất)
                foreach (Pigs pig in pigs)
                {
                    if (pig.Status != "alive")
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                            $"Heo {pig.Id} không ở trạng thái có thể xuất");

                    pig.Status = "pending";
                }

                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                // Trả về thông tin đã cập nhật
                return new PigExportRequestModelView
                {
                    Id = exportRequest.Id,
                    Status = exportRequest.Status,
                    ApprovalDate = exportRequest.ApprovalDate,
                    ApprovedBy = exportRequest.ApprovedBy,
                    Note = "Đã duyệt đề xuất xuất heo thành công"
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                    ex.Message);
            }
        }

        public async Task<PigExportViewModel> CreatePigExport(PigExportDTO dto)
        {
            // Validate input
            if (dto.Details == null || !dto.Details.Any())
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Phải có ít nhất một heo trong phiếu xuất");
            }

            // Kiểm tra khách hàng tồn tại
            Customers? customer = await _unitOfWork.GetRepository<Customers>()
                .GetEntities
                .FirstOrDefaultAsync(c => c.Id == dto.CustomerId && c.DeleteTime == null)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy thông tin khách hàng");

            // Validate đơn giá
            if (dto.UnitPrice <= 0)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Đơn giá phải lớn hơn 0");
            }

            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Kiểm tra và lấy thông tin các heo
                decimal totalWeight = 0;
                List<PigExportDetail>? exportDetails = new List<PigExportDetail>();

                foreach (PigExportDetailDTO detail in dto.Details)
                {
                    Pigs? pig = await _unitOfWork.GetRepository<Pigs>()
                        .GetEntities
                        .FirstOrDefaultAsync(p => p.Id == detail.PigId
                            && p.Status == "pending"
                            && p.DeleteTime == null)
                        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                            $"Không tìm thấy heo {detail.PigId} hoặc heo chưa được duyệt xuất");

                    if (detail.ActualWeight <= 0)
                    {
                        throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                            $"Cân nặng của heo {detail.PigId} không hợp lệ");
                    }

                    totalWeight += detail.ActualWeight;

                    exportDetails.Add(new PigExportDetail
                    {
                        PigId = detail.PigId,
                        ActualWeight = detail.ActualWeight,
                        TotalAmount = detail.ActualWeight * dto.UnitPrice
                    });

                    // Cập nhật trạng thái heo thành đã xuất
                    pig.Status = "sold";
                    await _unitOfWork.GetRepository<Pigs>().UpdateAsync(pig);
                }

                // Tạo phiếu xuất
                PigExport? pigExport = new PigExport
                {
                    Id = await GenerateExportId(),
                    CustomerId = dto.CustomerId,
                    ExportDate = dto.ExportDate,
                    CreatedBy = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    UnitPrice = dto.UnitPrice,
                    TotalWeight = totalWeight,
                    TotalAmount = totalWeight * dto.UnitPrice,
                    Details = exportDetails
                };

                await _unitOfWork.GetRepository<PigExport>().InsertAsync(pigExport);
                await _unitOfWork.SaveAsync();



                PigExport? result = await _unitOfWork.GetRepository<PigExport>()
                    .GetEntities
                    .Include(e => e.Customers)
                    .Include(e => e.Details)
                        .ThenInclude(d => d.Pig)
                    .FirstOrDefaultAsync(e => e.Id == pigExport.Id);

                if (customer.Email != null && result != null)
                {
                    string subject = $"Thông báo xuất heo - Mã phiếu: {result.Id}";
                    string body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {{
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                }}
                                .container {{
                                    max-width: 600px;
                                    margin: 0 auto;
                                    padding: 20px;
                                    background-color: #f9f9f9;
                                    border-radius: 8px;
                                }}
                                .header {{
                                    background-color: #4CAF50;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 8px 8px 0 0;
                                }}
                                .content {{
                                    background-color: white;
                                    padding: 20px;
                                    border-radius: 0 0 8px 8px;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                }}
                                .info-table {{
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 20px 0;
                                }}
                                .info-table th, .info-table td {{
                                    padding: 12px;
                                    border: 1px solid #ddd;
                                }}
                                .info-table th {{
                                    background-color: #f5f5f5;
                                    text-align: left;
                                }}
                                .footer {{
                                    text-align: center;
                                    margin-top: 20px;
                                    padding-top: 20px;
                                    border-top: 1px solid #ddd;
                                    color: #666;
                                }}
                                .highlight {{
                                    color: #4CAF50;
                                    font-weight: bold;
                                }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <h1>Thông Báo Xuất Heo</h1>
                                </div>
                                <div class='content'>
                                    <p>Kính gửi <strong>{customer.Name}</strong>,</p>
                                    <p>Chúng tôi xin thông báo về việc xuất heo với thông tin chi tiết như sau:</p>
                                    
                                    <table class='info-table'>
                                        <tr>
                                            <th>Mã phiếu:</th>
                                            <td><span class='highlight'>{result.Id}</span></td>
                                        </tr>
                                        <tr>
                                            <th>Ngày xuất:</th>
                                            <td>{result.ExportDate:dd/MM/yyyy}</td>
                                        </tr>
                                        <tr>
                                            <th>Số lượng:</th>
                                            <td><strong>{result.Details.Count} con</strong></td>
                                        </tr>
                                        <tr>
                                            <th>Tổng khối lượng:</th>
                                            <td><strong>{result.TotalWeight:N1} kg</strong></td>
                                        </tr>
                                        <tr>
                                            <th>Đơn giá:</th>
                                            <td><strong>{result.UnitPrice:N0} VNĐ/kg</strong></td>
                                        </tr>
                                        <tr>
                                            <th>Tổng tiền:</th>
                                            <td><span class='highlight'>{result.TotalAmount:N0} VNĐ</span></td>
                                        </tr>
                                    </table>

                                    <p>Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ của chúng tôi.</p>
                                    
                                    <div class='footer'>
                                        <p>Trân trọng,<br><strong>PigFarm</strong></p>
                                        <small>Email này được gửi tự động, vui lòng không trả lời.</small>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>";
                    await _emailService.SendEmailAsync(customer.Email, subject, body);
                }
                await transaction.CommitAsync();
                return new PigExportViewModel
                {
                    Id = result.Id,
                    CustomerId = result.CustomerId,
                    ExportDate = result.ExportDate,
                    UnitPrice = result.UnitPrice,
                    TotalWeight = result.TotalWeight,
                    TotalAmount = result.TotalAmount,
                    CreatedBy = result.CreatedBy,
                    CustomerName = result.Customers.Name,
                    Details = result.Details.Select(d => new PigExportDetailViewModel
                    {
                        PigExportId = d.PigExportId,
                        PigId = d.PigId,
                        ActualWeight = d.ActualWeight,
                        TotalAmount = d.TotalAmount,

                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                    ex.Message);
            }
        }

        private async Task<string> GenerateExportId()
        {
            string dateStr = DateTime.Now.ToString("yyyyMMdd");

            // Lấy số thứ tự cao nhất trong ngày
            PigExport? lastExport = await _unitOfWork.GetRepository<PigExport>()
                .GetEntities
                .Where(e => e.Id.StartsWith($"PEX{dateStr}"))
                .OrderByDescending(e => e.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastExport != null)
            {
                string lastSequence = lastExport.Id.Substring(11); // Lấy 3 số cuối
                sequence = int.Parse(lastSequence) + 1;
            }

            return $"PEX{dateStr}{sequence:D3}";
        }

        public async Task<PigExportViewModel> GetPigExportById(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest,
                    "Id không được để trống");
            }

            // Lấy thông tin phiếu xuất kèm theo các quan hệ
            PigExport? export = await _unitOfWork.GetRepository<PigExport>()
                .GetEntities
                .Include(e => e.Customers)
                .Include(e => e.Details)
                    .ThenInclude(d => d.Pig)
                .FirstOrDefaultAsync(e => e.Id == id && e.DeleteTime == null)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound,
                    "Không tìm thấy phiếu xuất");

            // Lấy thông tin người tạo
            ApplicationUser? createdByUser = await _userManager.FindByIdAsync(export.CreatedBy);

            return new PigExportViewModel
            {
                Id = export.Id,
                CustomerId = export.CustomerId,
                CustomerName = export.Customers?.Name,
                ExportDate = export.ExportDate,
                CreatedBy = createdByUser?.UserName,
                CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == export.CreatedBy)?.FullName,
                TotalWeight = export.TotalWeight,
                TotalAmount = export.TotalAmount,
                UnitPrice = export.UnitPrice,
                Note = export.Note,
                Details = export.Details.Select(d => new PigExportDetailViewModel
                {
                    PigExportId = d.PigExportId,
                    PigId = d.PigId,
                    ActualWeight = d.ActualWeight,
                    TotalAmount = d.TotalAmount
                }).ToList()
            };
        }

        public async Task<List<PigExportViewModel>> GetAllPigExports()
        {
            // Lấy danh sách phiếu xuất
            List<PigExport>? exports = await _unitOfWork.GetRepository<PigExport>()
                .GetEntities
                .Include(e => e.Customers)
                .Include(e => e.Details)
                    .ThenInclude(d => d.Pig)
                .Where(e => e.DeleteTime == null)
                .OrderByDescending(e => e.ExportDate)
                .ToListAsync();

            List<PigExportViewModel> result = new List<PigExportViewModel>();

            foreach (PigExport export in exports)
            {
                PigExportViewModel? viewModel = new PigExportViewModel
                {
                    Id = export.Id,
                    CustomerId = export.CustomerId,
                    CustomerName = export.Customers?.Name,
                    ExportDate = export.ExportDate,
                    TotalWeight = export.TotalWeight,
                    TotalAmount = export.TotalAmount,
                    UnitPrice = export.UnitPrice,
                    CreatedBy = export.CreatedBy,
                    CreatedByName = _unitOfWork.GetRepository<ApplicationUser>().GetEntities.FirstOrDefault(x => x.Id == export.CreatedBy)?.FullName,
                    Details = export.Details.Select(d => new PigExportDetailViewModel
                    {
                        PigExportId = d.PigExportId,
                        PigId = d.PigId,
                        ActualWeight = d.ActualWeight,
                        TotalAmount = d.TotalAmount
                    }).ToList()
                };
                result.Add(viewModel);
            }
            return result;
        }
    }
}