using System.Security.Claims;
using Application.DTOs.MovePig;
using Application.Interfaces;
using Application.Models.MovePig;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services;

public class MovePigService : IMovePigService

{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public MovePigService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
    }
    public async Task<MovePigModelView> CreateMovePig(CreateMovePigDTO createMovePigDTO)
    {
        using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            ApplicationUser? user = await _unitOfWork
            .GetRepository<ApplicationUser>()
            .GetByIdAsync(userId)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "User not found");

            Areas? fromArea = await _unitOfWork.GetRepository<Areas>().GetByIdAsync(createMovePigDTO.FromArea)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Khu chăn nuôi không tồn tại");
            Areas? toArea = await _unitOfWork.GetRepository<Areas>().GetByIdAsync(createMovePigDTO.ToArea)
            ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Khu chăn nuôi không tồn tại");

            string datePrefix = createMovePigDTO.MoveDate.ToString("ddMMyyyy");
            string baseId = "MP" + datePrefix;

            var existingMoves = await _unitOfWork.GetRepository<MovePigs>()
                .GetEntities
                .Where(m => m.Id.StartsWith(baseId))
                .ToListAsync();

            int maxNumber = 0;
            foreach (var move in existingMoves)
            {
                if (int.TryParse(move.Id.Substring(baseId.Length), out int number))
                {
                    maxNumber = Math.Max(maxNumber, number);
                }
            }

            string newId = baseId + (maxNumber + 1).ToString("D3");

            MovePigs? movePig = new MovePigs
            {
                Id = newId,
                MoveDate = createMovePigDTO.MoveDate,
                FromArea = fromArea.Name,
                ToArea = toArea.Name,
                Note = createMovePigDTO.Note,
                CreateBy = user.Id,
                TotalPigs = createMovePigDTO.MovePigDetails.Count,
            };

            await _unitOfWork.GetRepository<MovePigs>().InsertAsync(movePig);

            foreach (MovePigDetailDTO item in createMovePigDTO.MovePigDetails)
            {
                Pigs? pig = await _unitOfWork.GetRepository<Pigs>().GetByIdAsync(item.PigId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Heo không tồn tại");
                if (pig.Status == "dead" || pig.Status == "sold")
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Heo này đã chết hoặc đã bán");
                }

                Stables? fromStable = await _unitOfWork.GetRepository<Stables>().GetByIdAsync(item.FromStable)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Khu chăn nuôi không tồn tại");
                Stables? toStable = await _unitOfWork.GetRepository<Stables>().GetByIdAsync(item.ToStable)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Khu chăn nuôi không tồn tại");

                MovePigDetails? movePigDetail = new MovePigDetails
                {
                    MovePigId = movePig.Id,
                    PigId = item.PigId,
                    FromStable = fromStable.Name,
                    ToStable = toStable.Name,
                };
                await _unitOfWork.GetRepository<MovePigDetails>().InsertAsync(movePigDetail);

                fromStable.CurrentOccupancy -= 1;
                toStable.CurrentOccupancy += 1;

                await _unitOfWork.GetRepository<Stables>().UpdateAsync(fromStable);

                await _unitOfWork.GetRepository<Stables>().UpdateAsync(toStable);

                pig.UpdatedTime = DateTimeOffset.UtcNow;

                pig.StableId = toStable.Id;
                pig.NextWeighingDate = createMovePigDTO.MoveDate.AddDays(toArea.WeighingFrequency);
                await _unitOfWork.GetRepository<Pigs>().UpdateAsync(pig);
            }
            await _unitOfWork.SaveAsync();


            await transaction.CommitAsync();

            return new MovePigModelView
            {
                Id = movePig.Id,
                MoveDate = movePig.MoveDate,
                FromArea = movePig.FromArea,
                ToArea = movePig.ToArea,
                Note = movePig.Note,
                TotalPigs = movePig.TotalPigs,
                Status = movePig.Status,
                MovePigDetails = movePig.MovePigDetails.Select(x => new MovePigDetailModelView
                {
                    PigId = x.PigId,
                    FromStable = x.FromStable,
                    ToStable = x.ToStable,
                }).ToList(),
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, ex.Message);
        }
    }

    public async Task<MovePigModelView> GetMovePigById(string id)
    {
        MovePigs? movePig = await _unitOfWork.GetRepository<MovePigs>().GetByIdAsync(id)
        ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Phân chuyển heo không tồn tại");

        return new MovePigModelView
        {
            Id = movePig.Id,
            MoveDate = movePig.MoveDate,
            FromArea = movePig.FromArea,
            ToArea = movePig.ToArea,
            Note = movePig.Note,
            TotalPigs = movePig.TotalPigs,
            Status = movePig.Status,
            MovePigDetails = movePig.MovePigDetails.Select(x => new MovePigDetailModelView
            {
                PigId = x.PigId,
                FromStable = x.FromStable,
                ToStable = x.ToStable,
            }).ToList(),
        };
    }

    public async Task<List<MovePigModelView>> GetMovePigs(string? fromArea, string? toArea, string? status, DateTime? moveDate, int page, int pageSize)
    {
        IEnumerable<MovePigs>? query = _unitOfWork.GetRepository<MovePigs>().GetEntities.AsEnumerable();
        if (!string.IsNullOrEmpty(fromArea))
        {
            query = query.Where(x => x.FromArea == fromArea);
        }
        if (!string.IsNullOrEmpty(toArea))
        {
            query = query.Where(x => x.ToArea == toArea);
        }
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(x => x.Status == status);
        }
        if (moveDate != null)
        {
            query = query.Where(x => x.MoveDate == moveDate);
        }
        query = query.OrderByDescending(x => x.MoveDate);
        List<MovePigs> movePigs = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return movePigs.Select(x => new MovePigModelView
        {
            Id = x.Id,
            MoveDate = x.MoveDate,
            FromArea = x.FromArea,
            ToArea = x.ToArea,
            Note = x.Note,
            TotalPigs = x.TotalPigs,
            Status = x.Status,
            MovePigDetails = x.MovePigDetails.Select(y => new MovePigDetailModelView
            {
                PigId = y.PigId,
                FromStable = y.FromStable,
                ToStable = y.ToStable,
            }).ToList(),
        }).ToList();
    }
}
