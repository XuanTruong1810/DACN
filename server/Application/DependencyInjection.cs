using Application.Interfaces;
using Application.Mapping;
using Application.Services;
using Core.Stores;
using Microsoft.Extensions.DependencyInjection;
using server.Application.Services;
using Supabase;

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
        services.AddScoped<IPigIntakeService, PigIntakeService>();
        services.AddScoped<IStableService, StableService>();
        services.AddScoped<IPigService, PigService>();
        services.AddScoped<IAuthService, AuthService>();

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
        services.AddScoped<IFoodExportService, FoodExportService>();
        services.AddScoped<IWeighingHistoryService, WeighingHistoryService>();
        services.AddScoped<IMovePigService, MovePigService>();

        services.AddScoped<IMedicineRequestService, MedicineRequestService>();
        services.AddScoped<IMedicineImportService, MedicineImportService>();
        services.AddScoped<IVaccinationPlanService, VaccinationPlanService>();

        services.AddSingleton(provider =>
            new Client(
                Environment.GetEnvironmentVariable("SUPABASE_URL") ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy url"),
                Environment.GetEnvironmentVariable("SUPABASE_KEY") ?? throw new BaseException(StatusCodeHelper.InternalServerError, ErrorCode.InternalServerError, "Không tìm thấy key"),
                new SupabaseOptions { AutoRefreshToken = true }
            )
        );
        services.AddScoped<ISupabaseStorageService, SupabaseStorageService>();
        services.AddScoped<IRestoreService, RestoreService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<ICalenderWeighingService, CalenderWeighingService>();
        services.AddScoped<IPerformanceStatisticsService, PerformanceStatisticsService>();
        services.AddScoped<IPigExaminationService, PigExaminationService>();

        services.AddScoped<StatisticPerformanceService>();
        services.AddScoped<StatisticPigService>();
        services.AddScoped<StatisticInventoryService>();
    }
    public static void AddMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
    }
}