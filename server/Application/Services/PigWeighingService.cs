using System.Security.Claims;
using Application.DTOs.PigWeighing;
using Application.Interfaces;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace PigWeighing.Services
{
    public class PigWeighingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWeighingScheduleService _scheduleService;

        public PigWeighingService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IWeighingScheduleService scheduleService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _scheduleService = scheduleService;
        }

        public async Task<PigWeighingDetailModelView> CreateWeighing(CreatePigWeighingDto dto)
        {
            // Kiểm tra khu vực có lịch cân hôm nay không
            List<string> areasToWeigh = await _scheduleService.GetAreasNeedWeighingToday();
            if (!areasToWeigh.Contains(dto.AreaId))
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Khu vực này không có lịch cân hôm nay");

            // Kiểm tra đã có phiếu cân nào đang thực hiện chưa
            bool existingWeighing = await _unitOfWork.GetRepository<PigWeighings>()
                .GetEntities
                .AnyAsync(x => x.AreaId == dto.AreaId
                           && x.WeighingDate.Date == DateTime.Today
                           && x.Status != "Completed"
                           && x.Status != "Cancelled");

            if (existingWeighing)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Khu vực này đã có phiếu cân đang thực hiện");

            // Tạo mã phiếu cân: WEI[Ngày][Khu vực]
            string code = $"WEI{DateTime.Now:yyyyMMdd}{dto.AreaId}";

            // Tạo phiếu cân mới
            PigWeighings weighing = new PigWeighings
            {
                Id = code,
                AreaId = dto.AreaId,
                WeighingDate = DateTime.Now,
                WeighedBy = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Status = "Draft",
                Note = dto.Note
            };

            await _unitOfWork.GetRepository<PigWeighings>().InsertAsync(weighing);
            await _unitOfWork.SaveAsync();

            return await GetWeighingById(weighing.Id);
        }

        public async Task<WeighingItemModelView> AddWeighingDetail(AddWeighingDetailDto dto)
        {
            PigWeighings? weighing = await _unitOfWork.GetRepository<PigWeighings>()
                .GetByIdAsync(dto.WeighingId);

            if (weighing == null)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy phiếu cân");

            if (weighing.Status != "InProgress")
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Phiếu cân không ở trạng thái đang cân");

            // Lấy cân nặng trước đó của heo
            decimal? previousWeight = await GetLastWeight(dto.PigId);

            // Tạo chi tiết cân
            PigWeighingDetails detail = new PigWeighingDetails
            {
                PigWeighingId = dto.WeighingId,
                PigsId = dto.PigId,
                Weight = dto.Weight,
                PreviousWeight = previousWeight,
                WeightGain = previousWeight.HasValue ? dto.Weight - previousWeight.Value : null,
                Status = EvaluateWeightStatus(dto.Weight, previousWeight),
                Note = dto.Note
            };

            await _unitOfWork.GetRepository<PigWeighingDetails>().InsertAsync(detail);
            await UpdateWeighingSummary(weighing);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<WeighingItemModelView>(detail);
        }

        private async Task UpdateWeighingSummary(PigWeighings weighing)
        {
            List<PigWeighingDetails>? details = await _unitOfWork.GetRepository<PigWeighingDetails>()
                .GetEntities
                .Where(x => x.PigWeighingId == weighing.Id)
                .ToListAsync();

            weighing.TotalPigs = details.Count;
            weighing.TotalWeight = details.Sum(d => d.Weight);
            weighing.AverageWeight = details.Any() ? weighing.TotalWeight / weighing.TotalPigs : null;
            weighing.AverageWeightGain = details.Any(d => d.WeightGain.HasValue)
                ? details.Where(d => d.WeightGain.HasValue).Average(d => d.WeightGain.Value)
                : null;
        }

        private string EvaluateWeightStatus(decimal currentWeight, decimal? previousWeight)
        {
            if (!previousWeight.HasValue)
                return "Normal";

            decimal gain = currentWeight - previousWeight.Value;

            if (gain < 0)
                return "Critical";
            if (gain < 0.3m) // Tăng dưới 0.3kg là Warning
                return "Warning";

            return "Normal";
        }

        private async Task<decimal?> GetLastWeight(string pigId)
        {
            var lastWeighing = await _unitOfWork.GetRepository<PigWeighingDetails>()
                .GetEntities
                .Where(x => x.PigsId == pigId)
                .OrderByDescending(x => x.CreatedTime)
                .FirstOrDefaultAsync();

            return lastWeighing?.Weight;
        }

        public async Task<PigWeighingDetailModelView> GetWeighingById(string id)
        {
            // Lấy phiếu cân kèm theo chi tiết và thông tin khu vực
            var weighing = await _unitOfWork.GetRepository<PigWeighings>()
                .GetEntities
                .Include(x => x.Area)
                .Include(x => x.Details)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (weighing == null)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy phiếu cân");

            // Map sang ModelView
            var modelView = _mapper.Map<PigWeighingDetailModelView>(weighing);

            // Lấy thông tin người cân
            var weighedByUser = await _unitOfWork.GetRepository<ApplicationUser>()
                .GetByIdAsync(weighing.WeighedBy);
            if (weighedByUser != null)
            {
                modelView.WeighedByName = weighedByUser.FullName;
            }

            return modelView;
        }
    }
}