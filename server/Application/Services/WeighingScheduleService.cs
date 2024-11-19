using Application.DTOs.WeighingSchedule;
using Application.Interfaces;
using Application.ModelViews.WeighingSchedule;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Application.Services
{
    public class WeighingScheduleService : IWeighingScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public WeighingScheduleService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<WeighingScheduleModelView> CreateSchedule(CreateWeighingScheduleDto dto)
        {
            var existingSchedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .AnyAsync(x => x.AreaId == dto.AreaId && x.IsActive);

            if (existingSchedule)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Khu vực này đã có lịch cân đang áp dụng");

            if (dto.WeighingDays.Count != dto.TimesPerWeek)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số ngày cân không khớp với tần suất cân");

            if (dto.WeighingDays.Any(d => d < 1 || d > 7))
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Ngày cân không hợp lệ (phải từ 1-7)");

            var schedule = new WeighingSchedule
            {
                AreaId = dto.AreaId,
                TimesPerWeek = dto.TimesPerWeek,
                WeighingDays = string.Join(",", dto.WeighingDays.OrderBy(d => d)),
                IsActive = true,
                StartDate = DateTime.Now,
                CreatedBy = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Description = dto.Description
            };

            await _unitOfWork.GetRepository<WeighingSchedule>().InsertAsync(schedule);
            await _unitOfWork.SaveAsync();

            return await GetScheduleById(schedule.Id);
        }

        public async Task<WeighingScheduleModelView> UpdateSchedule(UpdateWeighingScheduleDto dto)
        {
            WeighingSchedule? schedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetByIdAsync(dto.Id);

            if (schedule == null)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy lịch cân");

            if (dto.WeighingDays.Count != dto.TimesPerWeek)
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Số ngày cân không khớp với tần suất cân");

            schedule.TimesPerWeek = dto.TimesPerWeek;
            schedule.WeighingDays = string.Join(",", dto.WeighingDays.OrderBy(d => d));
            schedule.Description = dto.Description;

            await _unitOfWork.GetRepository<WeighingSchedule>().UpdateAsync(schedule);
            await _unitOfWork.SaveAsync();

            return await GetScheduleById(schedule.Id);
        }

        public async Task<bool> DeleteSchedule(string id)
        {
            WeighingSchedule? schedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetByIdAsync(id);

            if (schedule == null)
                return false;

            schedule.IsActive = false;
            await _unitOfWork.GetRepository<WeighingSchedule>().UpdateAsync(schedule);
            await _unitOfWork.SaveAsync();

            return true;
        }

        public async Task<bool> ToggleScheduleStatus(string id, bool isActive)
        {
            WeighingSchedule? schedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetByIdAsync(id);

            if (schedule == null)
                return false;

            schedule.IsActive = isActive;
            await _unitOfWork.GetRepository<WeighingSchedule>().UpdateAsync(schedule);
            await _unitOfWork.SaveAsync();

            return true;
        }

        public async Task<WeighingScheduleModelView> GetScheduleById(string id)
        {
            WeighingSchedule? schedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .Include(x => x.Area)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (schedule == null)
                return null;

            WeighingScheduleModelView? modelView = _mapper.Map<WeighingScheduleModelView>(schedule);
            modelView.WeighingDaysText = GetWeighingDaysText(schedule.WeighingDaysList);

            return modelView;
        }

        public async Task<WeighingScheduleModelView> GetScheduleByArea(string areaId)
        {
            WeighingSchedule? schedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .Include(x => x.Area)
                .FirstOrDefaultAsync(x => x.AreaId == areaId && x.IsActive);

            if (schedule == null)
                return null;

            var modelView = _mapper.Map<WeighingScheduleModelView>(schedule);
            modelView.WeighingDaysText = GetWeighingDaysText(schedule.WeighingDaysList);

            return modelView;
        }

        public async Task<List<WeighingScheduleModelView>> GetAllSchedules()
        {
            List<WeighingSchedule>? schedules = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .Include(x => x.Area)
                .OrderBy(x => x.Area.Name)
                .ToListAsync();

            List<WeighingScheduleModelView>? modelViews = _mapper.Map<List<WeighingScheduleModelView>>(schedules);
            foreach (WeighingScheduleModelView mv in modelViews)
            {
                mv.WeighingDaysText = GetWeighingDaysText(
                    schedules.First(s => s.Id == mv.Id).WeighingDaysList);
            }

            return modelViews;
        }

        public async Task<List<WeighingScheduleModelView>> GetActiveSchedules()
        {
            List<WeighingSchedule>? schedules = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .Include(x => x.Area)
                .Where(x => x.IsActive)
                .OrderBy(x => x.Area.Name)
                .ToListAsync();

            return _mapper.Map<List<WeighingScheduleModelView>>(schedules);
        }

        public async Task<List<string>> GetAreasNeedWeighingToday()
        {
            DayOfWeek today = DateTime.Now.DayOfWeek;
            int dayNumber = today == DayOfWeek.Sunday ? 7 : (int)today;

            List<WeighingSchedule>? schedules = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .Where(x => x.IsActive && x.WeighingDays.Contains(dayNumber.ToString()))
                .ToListAsync();

            return schedules.Select(s => s.AreaId).ToList();
        }

        public async Task<DateTime?> GetNextWeighingDate(string areaId)
        {
            WeighingSchedule? schedule = await _unitOfWork.GetRepository<WeighingSchedule>()
                .GetEntities
                .FirstOrDefaultAsync(x => x.AreaId == areaId && x.IsActive);

            if (schedule == null)
                return null;

            DateTime today = DateTime.Now.Date;
            int currentDayNumber = today.DayOfWeek == DayOfWeek.Sunday ? 7 : (int)today.DayOfWeek;

            int nextDay = schedule.WeighingDaysList
                .Where(d => d > currentDayNumber)
                .OrderBy(d => d)
                .FirstOrDefault();

            if (nextDay > 0)
            {
                int daysToAdd = nextDay - currentDayNumber;
                return today.AddDays(daysToAdd);
            }

            nextDay = schedule.WeighingDaysList.Min();
            int daysUntilNextWeek = 8 - currentDayNumber;
            return today.AddDays(daysUntilNextWeek + nextDay - 1);
        }

        private string GetWeighingDaysText(List<int> days)
        {
            List<string> dayNames = days.Select(d => d switch
            {
                1 => "Thứ 2",
                2 => "Thứ 3",
                3 => "Thứ 4",
                4 => "Thứ 5",
                5 => "Thứ 6",
                6 => "Thứ 7",
                7 => "Chủ nhật",
                _ => d.ToString()
            }).ToList();

            return string.Join(", ", dayNames);
        }
    }
}