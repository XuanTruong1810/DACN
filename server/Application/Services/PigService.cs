using Application.DTOs;
using Application.DTOs.Pig;
using Application.Interfaces;
using Application.Models;
using Application.Models.PigCancelModelView;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

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

        public async Task<BasePagination<PigModelView>> GetAllAsync(PigFilterDTO filter)
        {
            // Bắt đầu query
            IQueryable<Pigs> pigQuery = _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(x => x.DeleteTime == null);

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
                pigQuery = pigQuery.Where(p => p.PigId.Contains(filter.Search));
            }

            int totalCount = await pigQuery.CountAsync();
            List<Pigs> pigs = await pigQuery.ToListAsync();
            List<PigModelView> pigModels = pigs.Select(p => new PigModelView
            {
                Id = p.Id,
                PigId = p.PigId,
                StableId = p.StableId,
                StableName = p.Stables.Name,
                AreaId = p.Stables.AreasId,
                AreaName = p.Stables.Areas.Name,
                CreatedTime = p.CreatedTime.Value,
                UpdatedTime = p.UpdatedTime.HasValue ? p.UpdatedTime.Value : null,
            }).ToList();
            // Phân trang

            return new BasePagination<PigModelView>(pigModels, totalCount, filter.PageIndex, filter.PageSize);
        }

        public async Task<PigModelView> CreateAsync(PigDTO dto)
        {
            // Kiểm tra mã heo đã tồn tại
            bool exists = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .AnyAsync(x => x.PigId == dto.PigId && x.DeleteTime == null);

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
                .FirstOrDefaultAsync(x => x.Id == id && x.DeleteTime == null)
                ?? throw new BaseException(
                    StatusCodeHelper.NotFound,
                    ErrorCode.NotFound,
                    "Không tìm thấy heo"
                );

            return _mapper.Map<PigModelView>(pig);
        }

        public async Task<List<PigModelView>> GetPigsByAreaAsync(string areaId)
        {
            var pigs = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(p => p.Stables.AreasId == areaId && p.DeleteTime == null)
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .ToListAsync();

            return _mapper.Map<List<PigModelView>>(pigs);
        }

        public async Task<List<PigModelView>> GetPigsByHouseAsync(string houseId)
        {
            List<Pigs>? pigs = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .Where(p => p.StableId == houseId && p.DeleteTime == null)
                .Include(p => p.Stables)
                .ThenInclude(s => s.Areas)
                .ToListAsync();

            return _mapper.Map<List<PigModelView>>(pigs);
        }

        public async Task<PigCancelModelView> CancelPigAsync(string id, PigCancelDTO dto)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống!");
            }

            Pigs? pig = await _unitOfWork.GetRepository<Pigs>()
                .GetEntities
                .FirstOrDefaultAsync(p => p.Id == id && p.DeleteTime == null)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy heo");
            _mapper.Map(dto, pig);
            pig.DeleteTime = DateTimeOffset.UtcNow;
            await _unitOfWork.GetRepository<Pigs>().UpdateAsync(pig);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<PigCancelModelView>(pig);
        }

        public async Task<BasePagination<PigCancelModelView>> GetPigCancelAsync(int pageIndex, int pageSize)
        {
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
    }
}