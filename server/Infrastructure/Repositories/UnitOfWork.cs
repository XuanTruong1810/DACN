using Core.Repositories;
using Infrastructure.Context;

namespace Infrastructure.Repositories
{
    public class UnitOfWork(DataBaseContext dataBaseContext) : IUnitOfWork
    {
        private readonly DataBaseContext context = dataBaseContext;
        private bool disposed = false;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    context.Dispose();
                }
                disposed = true;
            }
        }
        public async Task SaveAsync()
        {
            await context.SaveChangesAsync();
        }
        public IGenericRepository<Entity> GetRepository<Entity>() where Entity : class
        {
            return new GenericRepository<Entity>(context);
        }
    }
}