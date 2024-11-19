namespace Application.DTOs.MovePig;

public class CreateMovePigDTO
{
    public DateTime MoveDate { get; set; }
    public string FromArea { get; set; }
    public string ToArea { get; set; }
    public string? Note { get; set; }
    public List<MovePigDetailDTO> MovePigDetails { get; set; }
}


public class MovePigDetailDTO
{
    public string PigId { get; set; }
    public string FromStable { get; set; }
    public string ToStable { get; set; }
}



// 2024-11-19 -- Khu A -> Khu B -- 10 con heo

// Heo1 - Chuồng A1 - Chuồng B1
// Heo2 - Chuồng A1 - Chuồng B1
// Heo3 - Chuồng A1 - Chuồng B1
