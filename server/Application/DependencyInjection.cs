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
        // services.AddHttpContextAccessor();
        services.AddScoped<IAreaService, AreaService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IPigIntakeService, PigIntakeService>();
        services.AddScoped<IStableService, StableService>();
        services.AddScoped<IPigService, PigService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IFeedIntakeService, FeedIntakeService>();

        services.AddScoped<IFeedService, FeedService>();
        services.AddScoped<IFeedTypeService, FeedTypeService>();

        // services.AddScoped<IMedicationAndVaccine Service, MedicationAndVaccineService>();
        // services.AddScoped<IMedicationAndVaccineIntakeService, MedicationAndVaccineIntakeService>();

        // services.AddScoped<IHealthRecordService, HealthRecordService>();

        services.AddScoped<IFoodTypeService, FoodTypeService>();
        services.AddScoped<IFoodService, FoodService>();
        services.AddScoped<IFoodImportRequestService, FoodImportRequestService>();
        services.AddScoped<IFoodImportService, FoodImportService>();
        services.AddScoped<IEmailService, EmailService>();

        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();

        services.AddScoped<IMedicineService, MedicineService>();
        services.AddScoped<IPigExportService, PigExportService>();
        services.AddScoped<ICustomerService, CustomerService>();
    }
    public static void AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
    }
}