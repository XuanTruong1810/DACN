using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using AutoMapper;
using Core.Base;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
namespace Application.Services
{
    public class PigIntakeService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor) : IPigIntakeService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        private readonly IMapper mapper = mapper;
        private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;
        public async Task<BasePagination<PigInTakeModelView>> GetAllAsync(int pageIndex, int pageSize, string? filter)
        {
            IEnumerable<PigIntakes>? pigIntakes = await unitOfWork.GetRepository<PigIntakes>().GetAllAsync();
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
            int totalCount = pigIntakes.Count();
            List<PigIntakes>? pagedPigIntakes = pigIntakes
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToList();
            List<PigInTakeModelView>? pigIntakeModels = mapper.Map<List<PigInTakeModelView>>(pagedPigIntakes);
            BasePagination<PigInTakeModelView>? paginationResult = new(pigIntakeModels, pageSize, pageIndex, totalCount);
            return paginationResult;
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

            return result;

        }
        public async Task UpdateIntakeAsync(string id, PigIntakeUpdateDTO model)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }
            PigIntakes? pigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Not found");

            mapper.Map(model, pigIntake);

            await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(pigIntake);

            /// --- Insert Pig to stable

            await unitOfWork.SaveAsync();

        }




        public async Task AcceptIntakeAsync(string id, PigIntakeAcceptDTO model)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id is required");
            }
            PigIntakes? pigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(id)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Not found");

            mapper.Map(model, pigIntake);

            pigIntake.ApprovedTime = DateTimeOffset.UtcNow;

            await unitOfWork.GetRepository<PigIntakes>().UpdateAsync(pigIntake);
            await unitOfWork.SaveAsync();

        }


        public async Task InsertIntakeAsync(PigIntakeInsertDTO dTO)
        {
            PigIntakes? pigIntake = mapper.Map<PigIntakes>(dTO);
            string? CreateBy = httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                throw new BaseException(Core.Stores.StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Unauthorized");

            pigIntake.CreateBy = CreateBy;
            await unitOfWork.GetRepository<PigIntakes>().InsertAsync(pigIntake);
            await unitOfWork.SaveAsync();

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
    }
}