using Core.Repositories;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore.Storage;

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

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            try
            {
                return await context.Database.BeginTransactionAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi bắt đầu transaction", ex);
            }
        }

        public void ClearTracked()
        {
            context.ChangeTracker.Clear();
        }
    }
}