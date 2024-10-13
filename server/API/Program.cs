using Application.SeedData;
using dotenv.net;

WebApplicationBuilder? builder = WebApplication.CreateBuilder(args);

DotEnv.Load();

builder.Services.ConfigureServices();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        //options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());

    });
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();
WebApplication? app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();


app.UseMiddleware<HandleException>();

app.UseCors("AllowOrigin");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

using (IServiceScope scope = app.Services.CreateScope())
{
    IServiceProvider? services = scope.ServiceProvider;
    SeedDataAccount.SeedAsync(services).Wait();
}
app.Run();

