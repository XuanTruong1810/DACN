namespace Application.Models.PigCancelModelView
{
    public class PigCancelModelView
    {

        public string PigId { get; set; }
        public string DeathReason { get; set; }
        public string DeathNote { get; set; }
        public string HandlingMethod { get; set; }
        public string HandlingNotes { get; set; }

        public DateTimeOffset? DeathDate { get; set; }

        public string Status { get; set; }
    }
}