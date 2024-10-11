using Application.Interfaces;
using Core.Entities;
using Core.Repositories;
using Core.Stores;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class PigService(IUnitOfWork unitOfWork) : IPigService
    {
        private readonly IUnitOfWork unitOfWork = unitOfWork;
        public async Task AllocatePigsToStableAsync(string pigIntakeId)
        {
            PigIntakes? PigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(pigIntakeId)
            ?? throw new BaseException(Core.Stores.StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy id của hóa đơn");

            List<Stables>? availableStables = await unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(s => s.Capacity > s.CurrentOccupancy && s.AreasId == "")
                .ToListAsync();

            int? pigAccept = PigIntake.AcceptedQuantity
             ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy số lượng hóa đơn đã chấp nhận");
            List<Pigs> list = new List<Pigs>();
            int stableIndex = 0;
            for (int i = 1; i <= pigAccept; i++)
            {
                Stables? currentStable = availableStables[stableIndex];
                string pigCode = $"{PigIntake.UpdatedTime} - {PigIntake.SuppliersId} - {currentStable.CurrentOccupancy}";
                Pigs newPig = new Pigs
                {
                    PigId = pigCode,
                    StableId = availableStables[stableIndex].Id,
                };
                list.Add(newPig);
                currentStable.CurrentOccupancy++;
                if (currentStable.Pigs.Count >= currentStable.Capacity)
                {
                    stableIndex++;
                }
            }

            await unitOfWork.GetRepository<Pigs>().AddRangeAsync(list);

            foreach (Stables stable in availableStables)
            {
                await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
            }

            await unitOfWork.SaveAsync();
        }
    }
}