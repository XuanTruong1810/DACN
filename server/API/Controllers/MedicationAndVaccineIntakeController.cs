using Application.DTOs;
using Application.Interfaces;
using Application.Models;
using Core.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class MedicationAndVaccineIntakeController(IMedicationAndVaccineIntakeService medicationAndVaccineIntakeService) : ControllerBase
    {
        private readonly IMedicationAndVaccineIntakeService medicationAndVaccineIntakeService = medicationAndVaccineIntakeService;
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMedVacIntake(DateTimeOffset? date, string? supplierId, string? statusManager, string? inStock, string? id, int pageIndex, int pageSize)
        {
            BasePagination<MedVacIntakeResponseModel>? data = await medicationAndVaccineIntakeService.GetMedVacIntake(date, supplierId, statusManager, inStock, id, pageIndex, pageSize);
            return Ok(BaseResponse<BasePagination<MedVacIntakeResponseModel>>.OkResponse(data));
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Veterinarian")]
        public async Task<IActionResult> CreateMedVacIntake([FromBody] List<MedVacIntakeDTO> DTO)
        {
            await medicationAndVaccineIntakeService.CreateMedVacIntake(DTO);
            return Ok(BaseResponse<object>.OkResponse("Tạo thành công"));
        }
        [HttpPatch("AcceptMedVacIntake")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AcceptMedVacIntake(string medVacIntakeId, [FromBody] MedVacIntakeAcceptDTO DTO)
        {
            await medicationAndVaccineIntakeService.AcceptMedVacIntake(medVacIntakeId, DTO);
            return Ok(BaseResponse<object>.OkResponse("Chấp thuận thành công"));
        }
        [HttpDelete]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelMedVacIntake(string medVacIntakeId)
        {
            await medicationAndVaccineIntakeService.CancelMedVacIntake(medVacIntakeId);
            return Ok(BaseResponse<object>.OkResponse("Xóa thành công"));
        }

        [HttpPatch("MedVacIntakeDelivery")]
        [Authorize(Roles = "Admin, Veterinarian")]
        public async Task<IActionResult> MedVacIntakeDelivery(string medVacIntakeId, [FromBody] MedVacDeliveryDTO DTO)
        {
            await medicationAndVaccineIntakeService.MedVacIntakeDelivery(medVacIntakeId, DTO);
            return Ok(BaseResponse<object>.OkResponse("Hóa đơn đã giao thành công"));
        }

        [HttpPatch("UpdateQuantityForMedVac")]
        [Authorize(Roles = "Veterinarian, Admin")]
        public async Task<IActionResult> UpdateQuantityForMedVac(string medVacIntakeId)
        {
            await medicationAndVaccineIntakeService.UpdateQuantityForMedVac(medVacIntakeId);
            return Ok(BaseResponse<object>.OkResponse("Thêm vào kho thành công"));
        }
    }
}