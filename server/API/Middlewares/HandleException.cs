using System.Text.Json;
using Core.Stores;

public class HandleException(RequestDelegate next)
{
    private readonly RequestDelegate next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (BaseException ex)
        {
            await HandleExceptionAsync(context, ex.StatusCodeHelper, ex.ErrorCode, ex.Message.ToString());
        }

    }
    private async Task HandleExceptionAsync(HttpContext context, StatusCodeHelper statusCodeHelper, string errorCode, object errorMessage)
    {
        context.Response.StatusCode = (int)statusCodeHelper;
        context.Response.ContentType = "application/json";
        var response = new
        {
            statusCode = statusCodeHelper,
            Code = errorCode,
            message = errorMessage
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
