using Core.Base;

namespace Core.Repositories
{
    public interface IGenericRepository<Entity> where Entity : class
    {
        IQueryable<Entity> GetEntities { get; }
        Task<IEnumerable<Entity>> GetAllAsync();
        Task<Entity> GetByIdAsync(object id);
        Task InsertAsync(Entity entity);
        Task InsertRangeAsync(List<Entity> entities);
        Task UpdateAsync(Entity entity);
        Task DeleteAsync(object id);

        Task DeleteRangeAsync(List<Entity> entities);
        Task AddRangeAsync(List<Entity> entities);
        Task<BasePagination<Entity>> GetPagination(IQueryable<Entity> query, int index, int pageSize);
    }
}