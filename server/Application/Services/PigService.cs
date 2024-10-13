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
        public async Task AllocatePigsToStableAsync(string AreasId, string pigIntakeId)
        {

            PigIntakes? PigIntake = await unitOfWork.GetRepository<PigIntakes>().GetByIdAsync(pigIntakeId)
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy id của hóa đơn");


            List<Stables>? availableStables = await unitOfWork.GetRepository<Stables>()
                .GetEntities
                .Where(s => s.Capacity > s.CurrentOccupancy && s.AreasId == AreasId)
                .ToListAsync();

            if (availableStables == null || availableStables.Count == 0)
            {
                throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không có chuồng trại khả dụng");
            }


            int? pigAccept = PigIntake.AcceptedQuantity
                ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Không tìm thấy số lượng hóa đơn đã chấp nhận");

            List<Pigs> pigsList = new List<Pigs>();
            int stableIndex = 0;
            int availableStablesCount = availableStables.Count;

            for (int i = 1; i <= pigAccept; i++)
            {

                if (stableIndex >= availableStablesCount)
                {
                    throw new BaseException(StatusCodeHelper.BadRequest, ErrorCode.BadRequest, "Không đủ chuồng trại để phân bổ số lượng heo");
                }

                Stables currentStable = availableStables[stableIndex];

                string pigCode = $"{PigIntake.DeliveryDate:yyyyMMdd}_{currentStable.CurrentOccupancy + 1}";

                Pigs newPig = new Pigs
                {
                    PigId = pigCode,
                    StableId = currentStable.Id,
                };

                pigsList.Add(newPig);

                currentStable.CurrentOccupancy++;

                if (currentStable.CurrentOccupancy >= currentStable.Capacity)
                {
                    stableIndex++;
                }
            }


            await unitOfWork.GetRepository<Pigs>().AddRangeAsync(pigsList);


            foreach (Stables stable in availableStables)
            {
                await unitOfWork.GetRepository<Stables>().UpdateAsync(stable);
            }

            await unitOfWork.SaveAsync();
        }

    }
}