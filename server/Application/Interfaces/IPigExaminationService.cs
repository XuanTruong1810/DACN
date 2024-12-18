using Application.Models.PigExamination;

namespace Application.Interfaces
{
    public interface IPigExaminationService
    {
        Task<List<PigExaminationModelView>> GetPigExaminationAsync(string examinationType);


        Task<PigExaminationModelView> GetPigExaminationModelViewsAsync(string pigId);
    }
}