using Application.Interfaces;
using Application.Mapping;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddService(this IServiceCollection services)
    {
        services.AddServiceBusiness();
        services.AddMapping();
    }
    public static void AddServiceBusiness(this IServiceCollection services)
    {
        services.AddScoped<IAreaService, AreaService>();
        services.AddScoped<ISupplierService, SupplierService>();
    }
    public static void AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
    }
}