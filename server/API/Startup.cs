using System.Text;
using Core.Entities;
using Infrastructure;
using Infrastructure.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

public static class Startup
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddSwaggerGenUI();
        services.AddAuthentication();
        services.AddDBContext();
        services.AddService();
        services.AddIdentity();
        services.AddConfigTimeToken();
        services.AddInfrastructure();
        return services;
    }
    public static void AddSwaggerGenUI(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "MilkStore.API", Version = "v1" });
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
    public static void AddAuthentication(this IServiceCollection services)
    {
        services.AddAuthorization();
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
                ValidIssuer = Environment.GetEnvironmentVariable("ISSUER"),
                ValidAudience = Environment.GetEnvironmentVariable("AUDIENCE"),
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SECRET_KEY") ?? throw new Exception("Secret key not found")))
            };
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