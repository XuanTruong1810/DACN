using Application.DTOs;
using Application.DTOs.Pig;
using Application.Interfaces;
using Application.Models;
using Application.Models.PigCancelModelView;
using Application.Models.PigExport;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services
{
    public class PigService : IPigService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PigService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<PigInfoModelView>> GetAllAsync(PigFilterDTO filter)
        {
            // Bắt đầu query
            IQueryable<Pigs> pigQuery = _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(x => x.DeleteTime == null && x.Status == "alive");

            // Include thông tin chuồng và khu vực
            pigQuery = pigQuery
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas);

            // Lọc theo khu vực
            if (!string.IsNullOrEmpty(filter.AreaId))
            {
                pigQuery = pigQuery.Where(p => p.Stables.AreasId == filter.AreaId);
            }

            // Lọc theo chuồng
            if (!string.IsNullOrEmpty(filter.StableId))
            {
                pigQuery = pigQuery.Where(p => p.StableId == filter.StableId);
            }

            // Tìm kiếm theo mã heo
            if (!string.IsNullOrEmpty(filter.Search))
            {
                pigQuery = pigQuery.Where(p => p.Id.Contains(filter.Search));
            }

            int totalCount = await pigQuery.CountAsync();
            List<Pigs> pigs = await pigQuery.ToListAsync();
            List<PigInfoModelView> pigModels = pigs.Select(p => new PigInfoModelView
            {
                Id = p.Id,
                StableId = p.StableId,
                StableName = p.Stables.Name,
                AreaId = p.Stables.AreasId,
                AreaName = p.Stables.Areas.Name,
                CreatedTime = p.CreatedTime.Value,
                UpdatedTime = p.UpdatedTime.HasValue ? p.UpdatedTime.Value : null,
                Weight = p.Weight ?? 0,
                Status = p.Status,
                HealthStatus = p.HealthStatus,
                PigVaccinations = p.VaccinationPlans.Select(v => new PigVaccinationInfoModelView
                {
                    ActualDate = v.ActualDate,
                    LastModifiedTime = v.LastModifiedTime,
                    MedicineId = v.MedicineId,
                    MedicineName = v.Medicine.MedicineName,
                    ScheduleDate = v.ScheduledDate,
                    Status = v.Status

                }).ToList()
            }).ToList();
            return pigModels;
        }

        public async Task<PigModelView> CreateAsync(PigDTO dto)
        {
            // Kiểm tra mã heo đã tồn tại
            bool exists = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .AnyAsync(x => x.Id == dto.Id && x.DeleteTime == null && x.Status == "alive");

            if (exists)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Mã heo đã tồn tại");
            }

            // Kiểm tra chuồng tồn tại và còn chỗ
            var stable = await _unitOfWork.GetRepository<Stables>()
                .GetEntities
                .FirstOrDefaultAsync(s => s.Id == dto.StableId && s.DeleteTime == null)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy chuồng");

            if (stable.CurrentOccupancy >= stable.Capacity)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Chuồng đã đầy");
            }

            if (stable.Status != StatusStables.Available)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Chuồng không khả dụng");
            }



            Pigs? pig = _mapper.Map<Pigs>(dto);
            await _unitOfWork.GetRepository<Pigs>().InsertAsync(pig);


            stable.CurrentOccupancy += 1;
            if (stable.CurrentOccupancy >= stable.Capacity)
            {
                stable.Status = StatusStables.Full;
            }
            await _unitOfWork.GetRepository<Stables>().UpdateAsync(stable);

            await _unitOfWork.SaveAsync();

            return _mapper.Map<PigModelView>(pig);

        }

        public async Task<PigModelView> GetByIdAsync(string id)
        {
            Pigs? pig = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .FirstOrDefaultAsync(x => x.Id == id && x.DeleteTime == null && x.Status == "alive")
                ?? throw new BaseException(
                    StatusCodeHelper.NotFound,
                    ErrorCode.NotFound,
                    "Không tìm thấy heo"
                );

            return _mapper.Map<PigModelView>(pig);
        }

        public async Task<List<PigInfoModelView>> GetPigsByAreaAsync(string areaId)
        {
            var pigs = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(p => p.Stables.AreasId == areaId && p.DeleteTime == null)
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .Include(p => p.VaccinationPlans)
                .ThenInclude(vp => vp.Medicine)
                .ToListAsync();

            return pigs.Select(p => new PigInfoModelView
            {
                Id = p.Id,
                StableId = p.StableId,
                StableName = p.Stables.Name,
                AreaId = p.Stables.AreasId,
                AreaName = p.Stables.Areas.Name,
                CreatedTime = p.CreatedTime.Value,
                UpdatedTime = p.UpdatedTime.HasValue ? p.UpdatedTime.Value : null,
                Weight = p.Weight ?? 0,
                Status = p.Status,
                PigVaccinations = p.VaccinationPlans.Select(v => new PigVaccinationInfoModelView
                {
                    ActualDate = v.ActualDate,
                    LastModifiedTime = v.LastModifiedTime,
                    MedicineId = v.MedicineId,
                    MedicineName = v.Medicine.MedicineName,
                    ScheduleDate = v.ScheduledDate,
                    Status = v.Status
                }).ToList()
            }).ToList();
        }

        public async Task<List<PigInfoModelView>> GetPigsByHouseAsync(string houseId)
        {
            List<Pigs>? pigs = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(p => p.StableId == houseId && p.DeleteTime == null)
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .Include(p => p.VaccinationPlans)
                .ThenInclude(vp => vp.Medicine)
                .ToListAsync();

            return pigs.Select(p => new PigInfoModelView
            {
                Id = p.Id,
                StableId = p.StableId,
                StableName = p.Stables.Name,
                AreaId = p.Stables.AreasId,
                AreaName = p.Stables.Areas.Name,
                CreatedTime = p.CreatedTime.Value,
                UpdatedTime = p.UpdatedTime.HasValue ? p.UpdatedTime.Value : null,
                Weight = p.Weight ?? 0,
                Status = p.Status,
                PigVaccinations = p.VaccinationPlans.Select(v => new PigVaccinationInfoModelView
                {
                    ActualDate = v.ActualDate,
                    LastModifiedTime = v.LastModifiedTime,
                    MedicineId = v.MedicineId,
                    MedicineName = v.Medicine.MedicineName,
                    ScheduleDate = v.ScheduledDate,
                    Status = v.Status
                }).ToList()
            }).ToList();
        }

        public async Task<PigCancelModelView> CancelPigAsync(string id, PigCancelDTO dto)
        {
            using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống!");
                }

                Pigs? pig = await _unitOfWork.GetRepository<Pigs>()
                    .GetEntities
                    .Include(p => p.Stables)
                    .FirstOrDefaultAsync(p => p.Id == id && p.DeleteTime == null && p.Status == "alive")
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy heo này trong hệ thống");

                Stables stable = pig.Stables;
                stable.CurrentOccupancy--;
                if (stable.CurrentOccupancy < stable.Capacity)
                {
                    stable.Status = StatusStables.Available;
                }
                await _unitOfWork.GetRepository<Stables>().UpdateAsync(stable);


                List<VaccinationPlan>? vaccinationPlans = await _unitOfWork.GetRepository<VaccinationPlan>()
                    .GetEntities
                    .Where(vp => vp.PigId == id
                        && vp.IsActive
                        && vp.Status == "pending"
                        && vp.DeleteTime == null)
                    .ToListAsync();

                foreach (VaccinationPlan vaccinationPlan in vaccinationPlans)
                {
                    vaccinationPlan.Status = "cancelled";
                    vaccinationPlan.DeleteTime = DateTimeOffset.UtcNow;
                    await _unitOfWork.GetRepository<VaccinationPlan>().UpdateAsync(vaccinationPlan);
                }
                _mapper.Map(dto, pig);
                pig.DeleteTime = DateTimeOffset.UtcNow;
                pig.Status = "dead";
                await _unitOfWork.GetRepository<Pigs>().UpdateAsync(pig);





                await _unitOfWork.SaveAsync();


                await transaction.CommitAsync();


                return _mapper.Map<PigCancelModelView>(pig);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, ex.Message);
            }
        }

        public async Task<BasePagination<PigCancelModelView>> GetPigCancelAsync(int pageIndex, int pageSize)
        {
            // Đảm bảo pageIndex luôn >= 1
            pageIndex = Math.Max(1, pageIndex);
            // Đảm bảo pageSize luôn > 0
            pageSize = Math.Max(1, pageSize);

            IQueryable<Pigs>? query = _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(p => p.DeleteTime != null && p.Status == "dead");

            int totalItems = await query.CountAsync();

            List<Pigs> pigs = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            List<PigCancelModelView> pigCancelModels = pigs
                .Select(p => _mapper.Map<PigCancelModelView>(p))
                .ToList();

            BasePagination<PigCancelModelView>? pagination = new BasePagination<PigCancelModelView>(pigCancelModels, totalItems, pageIndex, pageSize);

            return pagination;
        }

        public async Task<List<PigExportModelView>> GetPigsForExportAsync()
        {
            List<PigExportModelView>? pigs = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .Include(p => p.VaccinationPlans)
                .Where(p => p.DeleteTime == null
                    && p.Status == "alive"
                    && p.Weight >= 95
                    && !_unitOfWork.GetRepository<PigExportRequestDetail>()
                        .GetEntities
                        .Any(d => d.PigId == p.Id
                            && d.PigExportRequest.Status == "pending"
                            && d.PigExportRequest.DeleteTime == null)
                    && p.VaccinationPlans.Any(v => v.IsActive
                        && v.DeleteTime == null
                        && v.Status == "completed"
                        && v.ActualDate != null))
                .Select(p => new PigExportModelView
                {
                    Id = p.Id,
                    Weight = p.Weight ?? 0,
                    StableName = p.Stables.Name,
                    AreaName = p.Stables.Areas.Name,
                    StableId = p.StableId,
                    AreaId = p.Stables.AreasId,
                    IsVaccinationComplete = p.VaccinationPlans.Any(v => v.IsActive
                        && v.DeleteTime == null
                        && v.Status == "completed"
                        && v.ActualDate != null),
                    HealthStatus = p.HealthStatus,
                    Note = "Đủ diều kiện xuất chuồng"
                })
                .OrderByDescending(p => p.Weight)
                .ToListAsync();

            return _mapper.Map<List<PigExportModelView>>(pigs);
        }

        public async Task<List<PigExportModelView>> GetPigsStatusPendingAsync(string status = "pending")
        {
            List<Pigs>? pigs = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .Where(p => p.Status == status && p.DeleteTime == null)
                .ToListAsync();
            List<PigExportModelView>? result = pigs.Select(p => new PigExportModelView
            {
                Id = p.Id,
                Weight = p.Weight ?? 0,
                StableName = p.Stables.Name,
                AreaName = p.Stables.Areas.Name,
                StableId = p.StableId,
                AreaId = p.Stables.AreasId,
                IsVaccinationComplete = p.VaccinationPlans.Any(v => v.IsActive
                    && v.DeleteTime == null
                    && v.Status == "completed"
                    && v.ActualDate != null),
                HealthStatus = p.HealthStatus,
                Note = "Đang chờ duyệt"

            }).ToList();
            return result;
        }
        public async Task<List<PigVaccinationModelView>> GetPigsVaccinationAsync(string? areaId, string? stableId)
        {
            IQueryable<Pigs>? query = _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .AsNoTracking()
                .Where(p => p.DeleteTime == null && p.Status == "alive");

            if (!string.IsNullOrEmpty(areaId))
            {
                query = query.Where(p => p.Stables.AreasId == areaId);
            }

            if (!string.IsNullOrEmpty(stableId))
            {
                query = query.Where(p => p.StableId == stableId);
            }
            List<Pigs>? pigs = await query.ToListAsync();
            return pigs.Select(p => new PigVaccinationModelView
            {
                Id = p.Id,
                StableId = p.StableId,
                StableName = p.Stables.Name,
                AreaId = p.Stables.AreasId,
                AreaName = p.Stables.Areas.Name,
                Weight = p.Weight ?? 0,
                HealthStatus = p.HealthStatus,
                VaccinationStatus = p.VaccinationPlans.Any(v => v.IsActive && v.DeleteTime == null && v.Status == "pending") ? "Chưa tiêm" : "Đã tiêm"
            }).ToList();
        }
    }
}