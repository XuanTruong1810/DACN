using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;

namespace Application.Services
{
    public class HealthRecordService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IMapper mapper) : IHealthRecordService
    {
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        private readonly IMapper mapper = mapper;
        private readonly IUnitOfWork unitOfWork = unitOfWork;

        public async Task CreateHealthRecordAsync(HealthRecordCreateDto DTO)
        {
            string createBy = httpContextAccessor.HttpContext?.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không tìm thấy User");

            HealthRecords? healthRecord = mapper.Map<HealthRecords>(DTO);
            healthRecord.CreateBy = createBy;

            await unitOfWork.GetRepository<HealthRecords>().InsertAsync(healthRecord);

            string recordId = healthRecord.Id;

            List<HealthRecordDetails>? details = mapper.Map<List<HealthRecordDetails>>(DTO.HealthRecordDetailDTO);
            details.ForEach(x => x.HealthRecordId = recordId);
            await unitOfWork.GetRepository<HealthRecordDetails>().AddRangeAsync(details);

            await unitOfWork.SaveAsync();
        }


    }
}