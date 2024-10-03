namespace Core.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Entity> GetRepository<Entity>() where Entity : class;
        Task SaveAsync();
    }
}