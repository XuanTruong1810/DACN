using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs;
using Application.Services;
using Application.Interfaces;

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
        [Authorize(Roles = "Veterinarian")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateMedicineRequestDTO dto)
        {
            string requestId = await _medicineRequestService.CreateRequest(dto);
            return Ok(BaseResponse<string>.OkResponse("Tạo yêu cầu nhập thuốc thành công"));
        }

        [HttpPost("{requestId}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRequest(string requestId, [FromBody] string supplierId)
        {
            await _medicineRequestService.ApproveRequest(requestId, supplierId);
            return Ok(BaseResponse<object>.OkResponse("Đã duyệt yêu cầu nhập thuốc"));
        }

        [HttpPost("import/{importId}/receive")]
        [Authorize(Roles = "Veterinarian")]
        public async Task<IActionResult> ReceiveImport(string importId, [FromBody] List<MedicineImportReceiveDetailDTO> details)
        {
            await _medicineRequestService.ReceiveImport(importId, details);
            return Ok(BaseResponse<object>.OkResponse("Đã nhận thuốc vào kho"));
        }
    }
}