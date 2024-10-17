using Core.Base;
using Core.Repositories;
using Core.Stores;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class GenericRepository<Entity> : IGenericRepository<Entity> where Entity : class
    {
        private readonly DataBaseContext context;
        private readonly DbSet<Entity> dbSet;
        public GenericRepository(DataBaseContext dataBaseContext)
        {
            this.context = dataBaseContext;
            this.dbSet = context.Set<Entity>();
        }

        public IQueryable<Entity> GetEntities => context.Set<Entity>();

        public async Task DeleteAsync(object id)
        {
            Entity entity = await dbSet.FindAsync(id) ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Entity not found");
            dbSet.Remove(entity);
        }
        public async Task<IEnumerable<Entity>> GetAllAsync()
        {
            return await dbSet.ToListAsync();
        }

        public async Task<Entity> GetByIdAsync(object id)
        {
            return await dbSet.FindAsync(id) ?? throw new BaseException(StatusCodeHelper.NotFound, ErrorCode.NotFound, "Entity not found");
        }

        public async Task InsertAsync(Entity entity)
        {
            await dbSet.AddAsync(entity);
        }

        public async Task InsertRangeAsync(List<Entity> entities)
        {
            await dbSet.AddRangeAsync(entities);
        }

        public Task UpdateAsync(Entity entity)
        {
            return Task.FromResult(dbSet.Update(entity));
        }
        public async Task<BasePagination<Entity>> GetPagination(IQueryable<Entity> query, int index, int pageSize)
        {
            query = query.AsNoTracking();
            int count = await query.CountAsync();
            IReadOnlyList<Entity> entities = await query.Skip((index - 1) * pageSize).Take(pageSize).ToListAsync();
            return new BasePagination<Entity>(entities, count, index, pageSize);
        }

        public async Task AddRangeAsync(List<Entity> entities)
        {
            await dbSet.AddRangeAsync(entities);
        }
    }
}