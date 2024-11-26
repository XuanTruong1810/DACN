namespace Core.Models.Statistics
{
    public class PigOverviewStats
    {
        public int TotalPigs { get; set; }
        public int HealthyPigs { get; set; }
        public int SickPigs { get; set; }
        public decimal AverageDailyGain { get; set; }
        public decimal PreviousMonthGain { get; set; }
        public decimal GainChangePercent { get; set; }
        public decimal AverageFCR { get; set; }
        public decimal StandardFCR { get; set; } = 2.8M;
        public decimal MarketingRate { get; set; }
        public decimal TargetMarketingRate { get; set; } = 97M;
        public decimal StableEfficiency { get; set; }
    }

    public class StablePerformanceDto
    {
        public string StableId { get; set; }
        public string StableName { get; set; }
        public int TotalPigs { get; set; }
        public decimal AverageWeight { get; set; }
        public decimal FCR { get; set; }
        public decimal MortalityRate { get; set; }
        public decimal Efficiency { get; set; }
        public int Capacity { get; set; }
        public int CurrentOccupancy { get; set; }
    }

    public class WeightDistributionStats
    {
        public string Range { get; set; }
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }
}