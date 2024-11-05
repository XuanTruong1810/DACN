// using System.Security.Claims;
// using Application.DTOs;
// using Application.Interfaces;
// using Application.Models;
// using AutoMapper;
// using Core.Base;
// using Core.Entities;
// using Core.Repositories;
// using Core.Stores;
// using Microsoft.AspNetCore.Http;
// using Microsoft.EntityFrameworkCore;

// namespace Application.Services
// {
//     public class MedicationAndVaccineService(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork, IMapper mapper) : IMedicationAndVaccineService
//     {
//         private readonly IHttpContextAccessor httpContextAccessor = httpContextAccessor;

//         private readonly IUnitOfWork unitOfWork = unitOfWork;

//         private readonly IMapper mapper = mapper;

//         public async Task DeleteMedVacAsync(string medVacId)
//         {
//             if (string.IsNullOrWhiteSpace(medVacId))
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống!");
//             }
//             MedicationAndVaccines? medVac = await unitOfWork
//             .GetRepository<MedicationAndVaccines>()
//             .GetByIdAsync(medVacId) ??
//             throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thuốc hoặc chích không tồn tại!");

//             if (medVac.DeleteTime.HasValue)
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Thuốc hoặc chích đã được xóa!");
//             }
//             medVac.DeleteTime = DateTimeOffset.Now;

//             await unitOfWork.GetRepository<MedicationAndVaccines>().UpdateAsync(medVac);
//             await unitOfWork.SaveAsync();
//         }
//         public async Task<MedVacGetModelView> InsertMedVacAsync(MedVacDTO medVac)
//         {
//             string? userID = httpContextAccessor.HttpContext?.User?
//             .FindFirst(ClaimTypes.NameIdentifier)?.Value
//             ?? throw new BaseException(StatusCodeHelper.Unauthorized, ErrorCode.Unauthorized, "Lỗi truy cập");

//             MedicationAndVaccines? medVacExists = unitOfWork
//             .GetRepository<MedicationAndVaccines>()
//             .GetEntities
//             .Where(mv => mv.MedVacName == medVac.MedVacName)
//             .FirstOrDefault();

//             if (medVacExists != null)
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Thuốc hoặc chích đã tồn tại!");
//             }

//             MedicationAndVaccines? medVacInsert = mapper.Map<MedicationAndVaccines>(medVac);
//             medVacInsert.CreateBy = userID;

//             await unitOfWork.GetRepository<MedicationAndVaccines>().InsertAsync(medVacInsert);
//             await unitOfWork.SaveAsync();

//             return mapper.Map<MedVacGetModelView>(medVacInsert);
//         }

//         public async Task<MedVacGetModelView> UpdateMedVacAsync(string medVacId, MedVacDTO medVacUpdate)
//         {
//             if (string.IsNullOrWhiteSpace(medVacId))
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống!");
//             }

//             MedicationAndVaccines? medVac = await unitOfWork
//             .GetRepository<MedicationAndVaccines>()
//             .GetByIdAsync(medVacId)
//             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thuốc hoặc chích không tồn tại!");

//             if (medVac.DeleteTime.HasValue)
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Thuốc hoặc chích đã được xóa!");
//             }

//             if (medVac.MedVacName == medVacUpdate.MedVacName)
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Tên thuốc này đã tồn tại!");
//             }

//             mapper.Map(medVacUpdate, medVac);
//             medVac.UpdatedTime = DateTimeOffset.Now;

//             await unitOfWork.GetRepository<MedicationAndVaccines>().UpdateAsync(medVac);
//             await unitOfWork.SaveAsync();

//             return mapper.Map<MedVacGetModelView>(medVac);
//         }

//         public async Task<BasePagination<MedVacGetModelView>> GetMedVacAsync(MedVacGetDTO medVacGetDTO)
//         {
//             IQueryable<MedicationAndVaccines> query = unitOfWork.GetRepository<MedicationAndVaccines>().GetEntities;
//             query = query.Where(mv => mv.DeleteTime == null);

//             if (medVacGetDTO.MedVacName != null)
//             {
//                 query = query.Where(mv => mv.MedVacName.Contains(medVacGetDTO.MedVacName));
//             }
//             if (medVacGetDTO.Type.HasValue)
//             {
//                 string? typeString = medVacGetDTO.Type.Value.ToString();
//                 query = query.Where(mv => mv.Type == typeString);
//             }


//             List<MedicationAndVaccines>? medicationAndVaccines = await query.ToListAsync();


//             List<MedVacGetModelView> medVacGetModelViews = medicationAndVaccines.Select(mv => new MedVacGetModelView
//             {
//                 Id = mv.Id,
//                 MedVacName = mv.MedVacName,
//                 DaysUsableAfterImport = mv.DaysUsableAfterImport.GetValueOrDefault(),
//                 Type = mv.Type,
//                 Quantity = mv.Quantity,
//                 Manufacturer = mv.Manufacturer,
//                 Description = mv.Description
//             }).ToList();

//             BasePagination<MedVacGetModelView> pagination = new(medVacGetModelViews, medVacGetDTO.PageSize, medVacGetDTO.PageIndex, await query.CountAsync());
//             return pagination;
//         }
//         public async Task<MedVacGetModelView> GetMedVacById(string medVacId)
//         {
//             if (string.IsNullOrWhiteSpace(medVacId))
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Id không được để trống!");
//             }
//             MedicationAndVaccines? medVac = await unitOfWork
//             .GetRepository<MedicationAndVaccines>()
//             .GetByIdAsync(medVacId) ??
//             throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Thuốc hoặc chích không tồn tại!");

//             if (medVac.DeleteTime.HasValue)
//             {
//                 throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Thuốc hoặc chích đã được xóa!");
//             }

//             return mapper.Map<MedVacGetModelView>(medVac);
//         }
//     }
// }
