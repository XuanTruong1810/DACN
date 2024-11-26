public class HousePerformanceStats
{
    public string HouseId { get; set; }
    public string HouseName { get; set; }
    public int TotalPigs { get; set; }
    public double AverageWeight { get; set; }
    public double FCR { get; set; }
    public double MortalityRate { get; set; }
    public double Efficiency { get; set; }
}

public class PerformanceOverviewStats
{
    public int TotalPigs { get; set; }
    public double AverageDailyGain { get; set; }
    public double AverageFCR { get; set; }
    public double OverallMortalityRate { get; set; }
    public double AverageEfficiency { get; set; }
    public double PreviousAverageDailyGain { get; set; }
    public int PigDeaths { get; set; }
    public int PigsExported { get; set; }
}