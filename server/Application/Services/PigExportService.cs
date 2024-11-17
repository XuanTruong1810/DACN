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
    public class PigExportService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager) : IPigExportService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager = userManager;

        private async Task<string> GenerateExportRequestId()
        {
            string dateStr = DateTime.Now.ToString("yyyyMMdd");

            // Lấy số thứ tự cao nhất trong ngày
            var lastRequest = await _unitOfWork.GetRepository<PigExportRequest>()
                .GetEntities
                .Where(r => r.Id.StartsWith($"PEXRQ{dateStr}"))
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastRequest != null)
            {
                // Lấy số thứ tự từ ID cuối cùng và tăng lên 1
                string lastSequence = lastRequest.Id.Substring(11); // Lấy 3 số cuối
                sequence = int.Parse(lastSequence) + 1;
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

                request.CreatedBy = createdByUser?.UserName;
                request.ApprovedBy = approvedByUser?.UserName;
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
            result.ApprovedBy = approvedByUser?.UserName;

            return result;
        }

        public async Task<PigExportRequestModelView> ApprovePigExportRequest(string id)
        {
            // Lấy đề xuất xuất heo
            var exportRequest = await _unitOfWork.GetRepository<PigExportRequest>()
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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError,
                    "Lỗi khi duyệt đề xuất xuất heo");
            }
        }
    }
}