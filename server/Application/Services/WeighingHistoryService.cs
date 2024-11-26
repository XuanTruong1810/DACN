using System.Security.Claims;
using Application.DTOs.WeighingHistory;
using Application.Interfaces;
using Application.ModelViews.WeighingHistory;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Services;
public class WeighingHistoryService : IWeighingHistoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public WeighingHistoryService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<WeighingHistoryModelView> CreateWeighingHistory(CreateWeighingHistoryDto dto)
    {
        using IDbContextTransaction? transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            Areas? area = await _unitOfWork
                   .GetRepository<Areas>()
                   .GetByIdAsync(dto.AreaId)
                   ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Area not found");

            // Get latest weighing history to generate new ID
            string today = DateTime.Now.ToString("yyyyMMdd");
            List<WeighingHistory>? weighingHistories = await _unitOfWork
                .GetRepository<WeighingHistory>()
                .GetEntities
                .ToListAsync(); // Lấy tất cả về client

            // Lọc và tạo ID mới ở phía client
            List<WeighingHistory>? todayWeighings = weighingHistories
                .Where(x => x.Id.StartsWith("WH" + today))
                .ToList();

            string newId;
            if (!todayWeighings.Any())
            {
                newId = "WH" + today + "001";
            }
            else
            {
                var lastNumber = todayWeighings
                    .Select(x => int.Parse(x.Id.Substring(10)))
                    .Max() + 1;
                newId = "WH" + today + lastNumber.ToString("D3");
            }

            WeighingHistory? weighingHistory = new()
            {
                Id = newId,
                WeighingDate = dto.WeighingDate,
                Note = dto.Note ?? "Cân heo ngày " + dto.WeighingDate,
                CreatedBy = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                TotalPigs = dto.WeighingDetails.Count,
                AverageWeight = dto.WeighingDetails.Average(x => x.Weight)
            };
            await _unitOfWork.GetRepository<WeighingHistory>().InsertAsync(weighingHistory);
            foreach (WeighingDetailDto weighingDetail in dto.WeighingDetails)
            {
                Pigs? pig = await _unitOfWork.GetRepository<Pigs>().GetByIdAsync(weighingDetail.PigId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Pig not found");
                await _unitOfWork.GetRepository<WeighingDetail>().InsertAsync(new WeighingDetail
                {
                    WeighingHistoryId = weighingHistory.Id,
                    PigId = weighingDetail.PigId,
                    Weight = weighingDetail.Weight,
                    Note = weighingDetail.Note
                });
                pig.Weight = weighingDetail.Weight;
                pig.LastWeighingDate = dto.WeighingDate;
                pig.NextWeighingDate = dto.WeighingDate.AddDays(area.WeighingFrequency);
                pig.UpdatedTime = dto.WeighingDate;
            }
            await _unitOfWork.SaveAsync();

            await transaction.CommitAsync();


            return new WeighingHistoryModelView
            {
                Id = weighingHistory.Id,
                WeighingDate = weighingHistory.WeighingDate,
                TotalPigs = weighingHistory.TotalPigs,
                AverageWeight = weighingHistory.AverageWeight,
                Note = weighingHistory.Note,
                CreatedBy = weighingHistory.CreatedBy,
                Details = weighingHistory.WeighingDetails.Select(x => new WeighingDetailModelView
                {
                    PigId = x.PigId,
                    Weight = x.Weight,
                    Note = x.Note
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, ex.Message);
        }
    }

    public Task DeleteWeighingHistory(string id)
    {
        throw new NotImplementedException();
    }

    public async Task<List<WeighingHistoryModelView>> GetAllWeighingHistories()
    {
        IEnumerable<WeighingHistory>? weighingHistories = await _unitOfWork
        .GetRepository<WeighingHistory>()
        .GetAllAsync();
        return weighingHistories.Select(x => new WeighingHistoryModelView
        {
            Id = x.Id,
            WeighingDate = x.WeighingDate,
            TotalPigs = x.TotalPigs,
            AverageWeight = x.AverageWeight,
            Note = x.Note,
            CreatedBy = x.CreatedBy,
            Details = x.WeighingDetails.Select(y => new WeighingDetailModelView
            {
                PigId = y.PigId,
                Weight = y.Weight,
                Note = y.Note
            }).ToList()
        }).ToList();
    }

    public Task<WeighingHistoryModelView> GetWeighingHistoryById(string id)
    {
        throw new NotImplementedException();
    }
}