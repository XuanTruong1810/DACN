using Application.DTOs;
using Application.ViewModels.Medicine;
using Core.Entities;

namespace Application.Interfaces
{
    public interface IMedicineRequestService
    {
        /// <summary>
        /// Tạo yêu cầu nhập thuốc mới
        /// </summary>
        /// <param name="dto">Thông tin yêu cầu nhập thuốc</param>
        /// <returns>ID của yêu cầu vừa tạo</returns>
        Task<string> CreateRequest(CreateMedicineRequestDTO dto);

        /// <summary>
        /// Duyệt yêu cầu nhập thuốc và tạo phiếu nhập với nhà cung cấp được chọn
        /// </summary>
        /// <param name="requestId">ID yêu cầu nhập thuốc</param>
        /// <param name="supplierId">ID nhà cung cấp được chọn</param>
        Task ApproveRequest(string requestId, string supplierId);

        /// <summary>
        /// Nhận thuốc vào kho
        /// </summary>
        /// <param name="importId">ID phiếu nhập</param>
        /// <param name="details">Chi tiết các thuốc nhận được</param>
        Task ReceiveImport(string importId, List<MedicineImportReceiveDetailDTO> details);

        /// <summary>
        /// Lấy danh sách yêu cầu nhập thuốc theo trạng thái
        /// </summary>
        /// <param name="status">Trạng thái yêu cầu</param>
        /// <returns>Danh sách yêu cầu</returns>
        Task<List<MedicineRequestViewModel>> GetRequests(RequestStatus? status = null);

        /// <summary>
        /// Lấy chi tiết một yêu cầu nhập thuốc
        /// </summary>
        /// <param name="requestId">ID yêu cầu</param>
        /// <returns>Chi tiết yêu cầu</returns>
        Task<MedicineRequestDetailViewModel> GetRequestDetail(string requestId);

        /// <summary>
        /// Lấy danh sách phiếu nhập thuốc
        /// </summary>
        /// <param name="status">Trạng thái phiếu nhập</param>
        /// <returns>Danh sách phiếu nhập</returns>
        Task<List<MedicineImportViewModel>> GetImports(ImportStatus? status = null);

        /// <summary>
        /// Lấy chi tiết phiếu nhập thuốc
        /// </summary>
        /// <param name="importId">ID phiếu nhập</param>
        /// <returns>Chi tiết phiếu nhập</returns>
        Task<MedicineImportDetailViewModel> GetImportDetail(string importId);
    }
}