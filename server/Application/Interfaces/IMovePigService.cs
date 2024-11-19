using Application.DTOs.MovePig;
using Application.Models.MovePig;

namespace Application.Interfaces;

public interface IMovePigService
{
    Task<MovePigModelView> CreateMovePig(CreateMovePigDTO createMovePigDTO);
    Task<MovePigModelView> GetMovePigById(string id);
    Task<List<MovePigModelView>> GetMovePigs(string? fromArea, string? toArea, string? status, DateTime? moveDate, int page, int pageSize);
}
