namespace Application.DTOs;
public class PigDTO
{
    public string PigId { get; set; }
    public string StableId { get; set; }
}

public class PigFilterDTO
{
    public string? AreaId { get; set; }
    public string? StableId { get; set; }
    public string? Search { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}