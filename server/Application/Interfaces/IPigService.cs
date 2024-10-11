namespace Application.Interfaces
{
    public interface IPigService
    {
        Task AllocatePigsToStableAsync(string pigIntakeId);
    }
}