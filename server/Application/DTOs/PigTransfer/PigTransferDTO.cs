using System.ComponentModel.DataAnnotations;
namespace Application.DTOs.PigTransfer;
public class CreatePigTransferDTO
{
    public List<PigTransferDetailDTO> Transfers { get; set; }
    public string? Note { get; set; }
}

public class PigTransferDetailDTO
{
    [Required]
    public string PigId { get; set; }

    [Required]
    public string ToStableId { get; set; }

    public string? Note { get; set; }
}

public class ApprovePigTransferDTO
{
    public string TransferId { get; set; }
    public bool IsApproved { get; set; }
    public string? RejectReason { get; set; }
}

public class ExecutePigTransferDTO
{
    public string TransferId { get; set; }
    public List<PigTransferExecutionDTO> Executions { get; set; }
}

public class PigTransferExecutionDTO
{
    public string PigId { get; set; }
    public bool IsSuccessful { get; set; }
    public string? FailureReason { get; set; }
}