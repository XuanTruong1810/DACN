using Core.Repositories;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Core.Entities;

namespace Application.Services;

public class StatisticInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<StatisticInventoryService> _logger;
    public StatisticInventoryService(IUnitOfWork unitOfWork, ILogger<StatisticInventoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public class InventoryStatisticResponse
    {
        public InventoryValueStats Current { get; set; }    // Tổng giá trị tồn kho (bên trái)
        public InventoryValueStats Latest { get; set; }     // Giá trị nhập kho gần nhất (bên phải)
    }

    public class InventoryValueStats
    {
        private decimal _value;
        private decimal _growthRate;

        public decimal Value
        {
            get => _value;
            set
            {
                _value = value;
                // Bỏ format tiền tệ, chỉ hiển thị số + đơn vị
                DisplayValue = value.ToString("N0");
            }
        }

        public string DisplayValue { get; private set; }

        public decimal GrowthRate
        {
            get => _growthRate;
            set
            {
                _growthRate = value;
                GrowthDisplay = $"Tăng {Math.Round(Math.Abs(value), 0)}%"; // Làm tròn số %
            }
        }

        public string GrowthDisplay { get; private set; }
    }

    public async Task<InventoryStatisticResponse> GetInventoryStatistics(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // 1. Tính tổng giá trị tồn kho hiện tại (cả thức ăn và thuốc)
            List<FoodImports>? currentFoodInventory = await _unitOfWork.GetRepository<FoodImports>().GetEntities
                .Where(f => f.DeleteTime == null &&
                           f.CreatedTime >= fromDate &&
                           f.CreatedTime <= toDate &&
                           f.StockedTime.HasValue)
                .ToListAsync();

            List<MedicineImport>? currentMedicineInventory = await _unitOfWork.GetRepository<MedicineImport>().GetEntities
                .Where(m => m.DeleteTime == null &&
                           m.CreatedTime >= fromDate &&
                           m.CreatedTime <= toDate &&
                           m.StockTime.HasValue)
                .ToListAsync();

            decimal totalValue = currentFoodInventory.Sum(i => i.TotalAmount.GetValueOrDefault()) +
                               currentMedicineInventory.Sum(i => i.TotalAmount.GetValueOrDefault());

            // 2. Lấy lần nhập kho gần nhất (cả thức ăn và thuốc)
            FoodImports? lastFoodImport = await _unitOfWork.GetRepository<FoodImports>().GetEntities
                .Where(i => i.DeleteTime == null)
                .OrderByDescending(i => i.CreatedTime)
                .FirstOrDefaultAsync();

            MedicineImport? lastMedicineImport = await _unitOfWork.GetRepository<MedicineImport>().GetEntities
                .Where(i => i.DeleteTime == null)
                .OrderByDescending(i => i.CreatedTime)
                .FirstOrDefaultAsync();

            // Lấy giá trị nhập kho gần nhất (lấy cái mới nhất giữa thức ăn và thuốc)
            decimal lastImportValue = 0;
            DateTime? lastImportDate = null;
            if (lastFoodImport != null && lastMedicineImport != null)
            {
                if (lastFoodImport.CreatedTime > lastMedicineImport.CreatedTime)
                {
                    lastImportValue = lastFoodImport.TotalAmount.GetValueOrDefault();
                    lastImportDate = lastFoodImport.CreatedTime.Value.DateTime;
                }
                else
                {
                    lastImportValue = lastMedicineImport.TotalAmount.GetValueOrDefault();
                    lastImportDate = lastMedicineImport.CreatedTime.Value.DateTime;
                }
            }
            else if (lastFoodImport != null)
            {
                lastImportValue = lastFoodImport.TotalAmount.GetValueOrDefault();
                lastImportDate = lastFoodImport.CreatedTime.Value.DateTime;
            }
            else if (lastMedicineImport != null)
            {
                lastImportValue = lastMedicineImport.TotalAmount.GetValueOrDefault();
                lastImportDate = lastMedicineImport.CreatedTime.Value.DateTime;
            }

            // 3. Tính tỷ lệ tăng của tổng tồn kho
            List<FoodImports>? lastMonthFoodInventory = await _unitOfWork.GetRepository<FoodImports>().GetEntities
                .Where(f => f.DeleteTime == null &&
                           f.CreatedTime >= fromDate.AddMonths(-1) &&
                           f.CreatedTime < fromDate &&
                           f.StockedTime.HasValue)
                .ToListAsync();

            List<MedicineImport>? lastMonthMedicineInventory = await _unitOfWork.GetRepository<MedicineImport>().GetEntities
                .Where(m => m.DeleteTime == null &&
                           m.CreatedTime >= fromDate.AddMonths(-1) &&
                           m.CreatedTime < fromDate &&
                           m.StockTime.HasValue)
                .ToListAsync();

            decimal lastMonthValue = lastMonthFoodInventory.Sum(i => i.TotalAmount.GetValueOrDefault()) +
                                    lastMonthMedicineInventory.Sum(i => i.TotalAmount.GetValueOrDefault());

            decimal inventoryGrowthRate = lastMonthValue > 0
                ? Math.Round((totalValue - lastMonthValue) / lastMonthValue * 100, 1)
                : 0;

            // 4. Tính tỷ lệ tăng của lần nhập gần nhất
            decimal previousImportValue = 0;
            if (lastImportDate.HasValue)
            {
                var previousFoodImport = await _unitOfWork.GetRepository<FoodImports>().GetEntities
                    .Where(i => i.DeleteTime == null && i.CreatedTime < lastImportDate)
                    .OrderByDescending(i => i.CreatedTime)
                    .FirstOrDefaultAsync();

                var previousMedicineImport = await _unitOfWork.GetRepository<MedicineImport>().GetEntities
                    .Where(i => i.DeleteTime == null && i.CreatedTime < lastImportDate)
                    .OrderByDescending(i => i.CreatedTime)
                    .FirstOrDefaultAsync();

                if (previousFoodImport != null && previousMedicineImport != null)
                {
                    previousImportValue = previousFoodImport.CreatedTime > previousMedicineImport.CreatedTime
                        ? previousFoodImport.TotalAmount.GetValueOrDefault()
                        : previousMedicineImport.TotalAmount.GetValueOrDefault();
                }
                else
                {
                    previousImportValue = (previousFoodImport?.TotalAmount ?? 0) + (previousMedicineImport?.TotalAmount ?? 0);
                }
            }

            decimal importGrowthRate = previousImportValue > 0
                ? Math.Round((lastImportValue - previousImportValue) / previousImportValue * 100, 1)
                : 0;

            return new InventoryStatisticResponse
            {
                Current = new InventoryValueStats
                {
                    Value = totalValue,
                    GrowthRate = inventoryGrowthRate
                },
                Latest = new InventoryValueStats
                {
                    Value = lastImportValue,
                    GrowthRate = importGrowthRate
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating inventory statistics");
            throw;
        }
    }

    private string FormatCurrency(decimal value)
    {
        if (value >= 1_000_000) // Triệu
        {
            decimal millions = Math.Round(value / 1_000_000, 0);
            return $"{millions} triệu";  // VD: "19 triệu"
        }
        else if (value >= 1_000) // Nghìn
        {
            decimal thousands = Math.Round(value / 1_000, 0);
            return $"{thousands} nghìn";  // VD: "825 nghìn"
        }

        return value.ToString("N0");
    }

    public class InventoryTrendResponse
    {
        public List<string> Labels { get; set; }        // Nhãn thời gian (T11, T12,...)
        public List<decimal> FoodValues { get; set; }   // Giá trị tồn kho thức ăn
        public decimal LastFoodValue { get; set; }      // Giá trị tồn thức ăn mới nhất
        public List<decimal> MedicineValues { get; set; } // Giá trị tồn kho thuốc
        public decimal LastMedicineValue { get; set; }    // Giá trị tồn thuốc mới nhất
    }

    public async Task<InventoryTrendResponse> GetInventoryTrend(DateTime fromDate, DateTime toDate)
    {
        try
        {
            // Lấy dữ liệu tồn kho thức ăn theo thời gian
            var foodInventory = await _unitOfWork.GetRepository<FoodImports>().GetEntities
                .Where(f => f.DeleteTime == null &&
                           f.CreatedTime >= fromDate &&
                           f.CreatedTime <= toDate &&
                           f.StockedTime.HasValue)
                .OrderBy(f => f.CreatedTime)
                .GroupBy(f => new { Month = f.CreatedTime.Value.Month, Year = f.CreatedTime.Value.Year })
                .Select(g => new
                {
                    Month = g.Key.Month,
                    Year = g.Key.Year,
                    TotalValue = g.Sum(f => f.TotalAmount.GetValueOrDefault())
                })
                .ToListAsync();

            // Lấy dữ liệu tồn kho thuốc theo thời gian
            var medicineInventory = await _unitOfWork.GetRepository<MedicineImport>().GetEntities
                .Where(m => m.DeleteTime == null &&
                           m.CreatedTime >= fromDate &&
                           m.CreatedTime <= toDate &&
                           m.StockTime.HasValue)
                .OrderBy(m => m.CreatedTime)
                .GroupBy(m => new { Month = m.CreatedTime.Value.Month, Year = m.CreatedTime.Value.Year })
                .Select(g => new
                {
                    Month = g.Key.Month,
                    Year = g.Key.Year,
                    TotalValue = g.Sum(m => m.TotalAmount.GetValueOrDefault())
                })
                .ToListAsync();

            // Tạo danh sách nhãn thời gian
            var labels = new List<string>();
            var foodValues = new List<decimal>();
            var medicineValues = new List<decimal>();

            var currentDate = fromDate;
            while (currentDate <= toDate)
            {
                var label = $"T{currentDate.Month}";
                labels.Add(label);

                var foodValue = foodInventory
                    .FirstOrDefault(f => f.Month == currentDate.Month && f.Year == currentDate.Year)
                    ?.TotalValue ?? 0;
                foodValues.Add(foodValue);

                var medicineValue = medicineInventory
                    .FirstOrDefault(m => m.Month == currentDate.Month && m.Year == currentDate.Year)
                    ?.TotalValue ?? 0;
                medicineValues.Add(medicineValue);

                currentDate = currentDate.AddMonths(1);
            }

            // Lấy giá trị mới nhất
            decimal lastFoodValue = foodValues.LastOrDefault();
            decimal lastMedicineValue = medicineValues.LastOrDefault();

            // Format giá trị hiển thị
            lastFoodValue = Math.Round(lastFoodValue / 1_000_000, 1); // Chuyển sang đơn vị triệu
            lastMedicineValue = Math.Round(lastMedicineValue / 1_000_000, 1);

            return new InventoryTrendResponse
            {
                Labels = labels,
                FoodValues = foodValues,
                LastFoodValue = lastFoodValue,      // "13.7 triệu"
                MedicineValues = medicineValues,
                LastMedicineValue = lastMedicineValue  // "5.3 triệu"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inventory trend");
            throw;
        }
    }

    public class LowStockItemResponse
    {
        public string Name { get; set; }          // Tên sản phẩm
        public string Type { get; set; }          // Loại: "Thức ăn" hoặc "Thuốc"
        public decimal CurrentStock { get; set; }   // Tồn kho hiện tại (với đơn vị)
        public decimal MinimumStock { get; set; }   // Mức tối thiểu (với đơn vị)

        public string Unit { get; set; }
        public bool IsLow { get; set; }           // Trạng thái sắp hết
    }

    public async Task<List<LowStockItemResponse>> GetLowStockItems(DateTime fromDate, DateTime toDate)
    {
        try
        {
            List<LowStockItemResponse> result = new List<LowStockItemResponse>();

            // 1. Lấy danh sách thức ăn sắp hết
            var foodItems = await _unitOfWork.GetRepository<FoodImports>().GetEntities
                .Include(f => f.FoodImportDetails)
                    .ThenInclude(fd => fd.Food)
                .Where(f => f.DeleteTime == null &&
                           f.StockedTime.HasValue &&
                           f.CreatedTime >= fromDate &&
                           f.CreatedTime <= toDate)
                .SelectMany(f => f.FoodImportDetails)
                .GroupBy(fd => new { fd.FoodId, fd.Food.Name })
                .Select(g => new
                {
                    g.Key.Name,
                    CurrentStock = g.Sum(fd => fd.ActualQuantity.GetValueOrDefault()),
                    MinimumStock = 500
                })
                .ToListAsync();

            foreach (var food in foodItems)
            {
                result.Add(new LowStockItemResponse
                {
                    Name = food.Name,
                    Type = "food",
                    CurrentStock = food.CurrentStock,
                    MinimumStock = food.MinimumStock,
                    Unit = "kg",
                    IsLow = food.CurrentStock <= food.MinimumStock
                });
            }

            // 2. Lấy danh sách thuốc sắp hết
            var medicineItems = await _unitOfWork.GetRepository<MedicineImport>().GetEntities
                .Include(m => m.MedicineImportDetails)
                    .ThenInclude(md => md.Medicines)
                .Where(m => m.DeleteTime == null &&
                           m.StockTime.HasValue &&
                           m.CreatedTime >= fromDate &&
                           m.CreatedTime <= toDate)
                .SelectMany(m => m.MedicineImportDetails)
                .GroupBy(md => new { md.MedicineId, md.Medicines.MedicineName })
                .Select(g => new
                {
                    Name = g.Key.MedicineName,
                    CurrentStock = g.Sum(md => md.AcceptedQuantity),
                    MinimumStock = 200,
                    Unit = g.First().Medicines.Unit
                })
                .ToListAsync();

            foreach (var medicine in medicineItems)
            {
                result.Add(new LowStockItemResponse
                {
                    Name = medicine.Name,
                    Type = "medicine",
                    CurrentStock = medicine.CurrentStock,
                    MinimumStock = medicine.MinimumStock,
                    Unit = medicine.Unit,
                    IsLow = medicine.CurrentStock <= medicine.MinimumStock
                });
            }

            // 3. Sắp xếp kết quả:
            // - Ưu tiên hiển thị các mặt hàng sắp hết (IsLow = true)
            // - Sau đó sắp xếp theo tên
            return result
                .OrderByDescending(i => i.IsLow)
                .ThenBy(i => i.Name)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting low stock items");
            throw;
        }
    }
}