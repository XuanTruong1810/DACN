using System.Text;
using Application.Interfaces;
using Application.Jobs;
using Application.Services;
using Core.Entities;
using Core.Settings;
using Infrastructure;
using Infrastructure.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Quartz;

public static class Startup
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddJobs();
        services.AddQuartzHostedService();
        services.AddCorsConfig();
        services.AddMemoryCache();
        services.AddHttpContextAccessor();
        services.AddSwaggerGenUI();
        services.AddDBContext();
        services.AddService();
        services.AddIdentity();
        services.AddAuthenticationJWTBearer();
        services.AddConfigTimeToken();
        services.AddInfrastructure();

        return services;
    }

    public static void AddJobs(this IServiceCollection services)
    {
        services.AddQuartz(options =>
        {
            JobKey? jobKey = new JobKey("DatabaseBackupJob");

            options.AddJob<DatabaseBackupJob>(jobKey);
            options.AddTrigger(opts =>
            {
                opts.ForJob(jobKey);
                opts.WithIdentity("DatabaseBackupJob-trigger");
                opts.WithCronSchedule(Environment.GetEnvironmentVariable("BACKUPTIME") ?? "0 * * * * ?");
            });
        });
    }

    public static void AddQuartzHostedService(this IServiceCollection services)
    {
        services.AddQuartzHostedService(options =>
        {
            options.WaitForJobsToComplete = true;
        });
    }

    public static void AddCorsConfig(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowOrigin",
                policy => policy.WithOrigins(Environment.GetEnvironmentVariable("CLIENT_DOMAIN") ?? throw new Exception("CLIENT_DOMAIN is not set"))
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                );
        });
    }
    public static void AddSwaggerGenUI(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "PigManagement.API", Version = "v1" });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "Example: \"Authorization: Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }
    public static void AddAuthenticationJWTBearer(this IServiceCollection services)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? throw new Exception("JWT_ISSUER is not set"),
                ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? throw new Exception("JWT_AUDIENCE is not set"),
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new Exception("JWT_KEY is not set")))
            };
        });

        services.AddAuthorization(options =>
        {
            // Admin
            options.AddPolicy("FullAccess", policy => policy.RequireClaim("Permission", new[] { "FullAccess" }));

            // Dispatch
            // đề xuất nhập heo
            options.AddPolicy("ProposePigImport", policy => policy.RequireClaim("Permission", new[] { "ProposePigImport", "FullAccess" }));
            // thêm heo vào chuồng
            options.AddPolicy("AssignPigToPen", policy => policy.RequireClaim("Permission", new[] { "AssignPigToPen", "FullAccess" }));

            // FeedManager
            // đề xuất nhập thức ăn
            options.AddPolicy("ProposeFeedImport", policy => policy.RequireClaim("Permission", new[] { "ProposeFeedImport", "FullAccess" }));
            // nhập thức ăn
            options.AddPolicy("ImportFeed", policy => policy.RequireClaim("Permission", new[] { "ImportFeed", "FullAccess" }));
            // xuất thức ăn
            options.AddPolicy("ExportFeed", policy => policy.RequireClaim("Permission", new[] { "ExportFeed", "FullAccess" }));

            // Veterinarian
            // khám bệnh
            options.AddPolicy("MedicalExamination", policy => policy.RequireClaim("Permission", "MedicalExamination,FullAccess"));
            // tiêm theo kế hoạch
            options.AddPolicy("PeriodicInjection", policy => policy.RequireClaim("Permission", new[] { "PeriodicInjection", "FullAccess" }));
            // đề xuất nhập thuốc
            options.AddPolicy("ProposeMedicineImport", policy => policy.RequireClaim("Permission", new[] { "ProposeMedicineImport", "FullAccess" }));
            // cân heo
            options.AddPolicy("WeighPig", policy => policy.RequireClaim("Permission", new[] { "WeighPig", "FullAccess" }));
            // chuyển heo
            options.AddPolicy("TransferPig", policy => policy.RequireClaim("Permission", new[] { "TransferPig", "FullAccess" }));
            // đề xuất xuất heo
            options.AddPolicy("ProposePigExport", policy => policy.RequireClaim("Permission", new[] { "ProposePigExport", "FullAccess" }));
        });
    }
    public static void AddDBContext(this IServiceCollection services)
    {
        services.AddDbContext<DataBaseContext>(options =>
        {
            options.UseLazyLoadingProxies().UseSqlServer(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING"));
        });
    }
    public static void AddIdentity(this IServiceCollection services)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {

        })
        .AddEntityFrameworkStores<DataBaseContext>()
        .AddDefaultTokenProviders();
    }
    public static void AddConfigTimeToken(this IServiceCollection services)
    {
        services.Configure<DataProtectionTokenProviderOptions>(options =>
        {
            options.TokenLifespan = TimeSpan.FromMinutes(30);
        });
    }
}