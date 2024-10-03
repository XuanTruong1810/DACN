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

        public Task UpdateAsync(Entity entity)
        {
            return Task.FromResult(dbSet.Update(entity));
        }
    }
}