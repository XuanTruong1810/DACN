// using System;
// using System.Collections.Generic;
// using System.ComponentModel.DataAnnotations;
// using System.ComponentModel.DataAnnotations.Schema;

// namespace Core.Entities
// {
//     public class PigTransfer : BaseEntity
//     {
//         public string CreatedBy { get; set; }
//         public string? ApprovedBy { get; set; }
//         public DateTimeOffset RequestDate { get; set; }
//         public DateTimeOffset? ApprovalDate { get; set; }
//         public DateTimeOffset? TransferDate { get; set; }
//         public string Status { get; set; } = "pending";    // pending - approved - rejected - completed
//         public string? Note { get; set; }
//         public string? RejectReason { get; set; }

//         [InverseProperty("PigTransfer")]
//         public virtual ICollection<PigTransferDetail> Details { get; set; }
//     }

//     public class PigTransferDetail
//     {
//         public string PigTransferId { get; set; }
//         public string PigId { get; set; }
//         public string FromStableId { get; set; }
//         public string ToStableId { get; set; }
//         public string Status { get; set; } = "pending";    // pending/completed/failed
//         public string? Note { get; set; }
//         public string? FailureReason { get; set; }

//         [ForeignKey("PigId")]
//         public virtual Pigs Pig { get; set; }
//         [ForeignKey("FromStableId")]
//         public virtual Stables FromStable { get; set; }
//         [ForeignKey("ToStableId")]
//         public virtual Stables ToStable { get; set; }
//         [ForeignKey("PigTransferId")]
//         public virtual PigTransfer PigTransfer { get; set; }
//     }
// }