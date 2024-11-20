using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Application.Services;
using Application.Interfaces;
using Application.DTOs.MedicineImport;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineRequestController : ControllerBase
    {
        private readonly IMedicineRequestService _medicineRequestService;

        public MedicineRequestController(IMedicineRequestService medicineRequestService)
        {
            _medicineRequestService = medicineRequestService;
        }

        [HttpPost]
        [Authorize(Roles = "Veterinarian,Admin")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateMedicineRequestDTO dto)
        {
            await _medicineRequestService.CreateRequest(dto);
            return Ok(BaseResponse<string>.OkResponse("Tạo yêu cầu nhập thuốc thành công"));
        }
        [HttpGet]
        [Authorize(Roles = "Veterinarian,Admin")]
        public async Task<IActionResult> GetRequests()
        {
            return Ok(BaseResponse<List<RequestMedicineModelView>>.OkResponse(await _medicineRequestService.GetRequests()));
        }
        [HttpGet("{requestId}")]
        [Authorize(Roles = "Veterinarian,Admin")]
        public async Task<IActionResult> GetRequestById(string requestId)
        {
            return Ok(BaseResponse<RequestMedicineModelView>.OkResponse(await _medicineRequestService.GetRequestById(requestId)));
        }
        [HttpPost("{requestId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRequest(string requestId, [FromBody] MedicineImportDTO dto)
        {
            await _medicineRequestService.ApproveRequest(requestId, dto);
            return Ok(BaseResponse<object>.OkResponse("Đã duyệt yêu cầu nhập thuốc"));
        }

        [HttpPost("{requestId}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectRequest(string requestId, [FromBody] string reason)
        {
            await _medicineRequestService.RejectRequest(requestId, reason);
            return Ok(BaseResponse<object>.OkResponse("Đã từ chối yêu cầu nhập thuốc"));
        }
    }
}