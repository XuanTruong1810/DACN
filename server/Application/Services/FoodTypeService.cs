using Application.DTOs.FoodType;
using Application.Interfaces;
using Application.Models.FoodTypeModelView;
using AutoMapper;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class FoodTypeService : IFoodTypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public FoodTypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<FoodTypeModelView> CreateFoodType(CreateFoodTypeDto createFoodTypeDto)
        {
            FoodTypes? existingFoodType = await _unitOfWork.GetRepository<FoodTypes>()
            .GetEntities
            .FirstOrDefaultAsync(x => x.FoodTypeName.ToLower() == createFoodTypeDto.FoodTypeName.ToLower());

            if (existingFoodType != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Loại thức ăn đã tồn tại trong hệ thống!");
            }

            FoodTypes newFoodType = _mapper.Map<FoodTypes>(createFoodTypeDto);
            FoodTypes? lastFoodType = await _unitOfWork.GetRepository<FoodTypes>()
                .GetEntities
                .Where(x => x.Id.StartsWith("FT"))
                .OrderByDescending(x => x.Id)
                .FirstOrDefaultAsync();

            string newId = lastFoodType == null ? "FT0001" :
                          int.TryParse(lastFoodType.Id[2..], out int lastNumber) ?
                          $"FT{lastNumber + 1:D4}" : "FT0001";

            newFoodType.Id = newId;

            await _unitOfWork.GetRepository<FoodTypes>().InsertAsync(newFoodType);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<FoodTypeModelView>(newFoodType);
        }

        public async Task<FoodTypeModelView> DeleteFoodType(string id)
        {
            FoodTypes? foodType = await _unitOfWork.GetRepository<FoodTypes>().GetByIdAsync(id)
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Loại thức ăn không tồn tại trong hệ thống!");

            foodType.DeleteTime = DateTimeOffset.Now;
            await _unitOfWork.GetRepository<FoodTypes>().UpdateAsync(foodType);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<FoodTypeModelView>(foodType);
        }

        public async Task<List<FoodTypeModelView>> GetAllFoodTypes()
        {
            List<FoodTypes> foodTypes = await _unitOfWork.GetRepository<FoodTypes>()
            .GetEntities
            .Where(x => x.DeleteTime == null)
            .ToListAsync();

            return _mapper.Map<List<FoodTypeModelView>>(foodTypes);
        }

        public async Task<FoodTypeModelView> GetFoodTypeById(string id)
        {
            FoodTypes? foodType = await _unitOfWork.GetRepository<FoodTypes>().GetByIdAsync(id)
                    ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Loại thức ăn không tồn tại trong hệ thống!");

            return _mapper.Map<FoodTypeModelView>(foodType);
        }

        public async Task<FoodTypeModelView> UpdateFoodType(string id, UpdateFoodTypeDto updateFoodTypeDto)
        {
            FoodTypes? existingFoodType = await _unitOfWork.GetRepository<FoodTypes>()
            .GetEntities
            .FirstOrDefaultAsync(x => x.Id != id && x.FoodTypeName.Equals(updateFoodTypeDto.FoodTypeName, StringComparison.CurrentCultureIgnoreCase));

            if (existingFoodType != null)
            {
                throw new BaseException(StatusCodeHelper.Conflict, ErrorCode.Conflict, "Loại thức ăn đã tồn tại trong hệ thống!");
            }

            FoodTypes foodType = _mapper.Map<FoodTypes>(updateFoodTypeDto);
            await _unitOfWork.GetRepository<FoodTypes>().UpdateAsync(foodType);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<FoodTypeModelView>(foodType);
        }
    }
}