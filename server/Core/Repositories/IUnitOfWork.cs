using Microsoft.EntityFrameworkCore.Storage;

namespace Core.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Entity> GetRepository<Entity>() where Entity : class;
        Task SaveAsync();

        Task<IDbContextTransaction> BeginTransactionAsync();

        void ClearTracked();
    }
}