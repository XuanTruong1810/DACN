namespace Core.Base
{
    public class BasePagination<T>(IReadOnlyCollection<T> items, int pageSize, int currentPage, int totalCount) where T : class
    {
        public IReadOnlyCollection<T> Items { get; private set; } = items;

        public int CurrentPage { get; private set; } = currentPage;

        public int TotalCount { get; private set; } = totalCount;

        public int TotalPage { get; private set; } = (int)Math.Ceiling(totalCount / (double)pageSize);

        public int PageSize { get; private set; } = pageSize;


        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPage;
    }

}