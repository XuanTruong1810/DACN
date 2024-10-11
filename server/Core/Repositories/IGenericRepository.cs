using Core.Base;

namespace Core.Repositories
{
    public interface IGenericRepository<Entity> where Entity : class
    {
        IQueryable<Entity> GetEntities { get; }
        Task<IEnumerable<Entity>> GetAllAsync();
        Task<Entity> GetByIdAsync(object id);
        Task InsertAsync(Entity entity);
        Task UpdateAsync(Entity entity);
        Task DeleteAsync(object id);
        Task<BasePagination<Entity>> GetPagination(IQueryable<Entity> query, int index, int pageSize);
    }
}