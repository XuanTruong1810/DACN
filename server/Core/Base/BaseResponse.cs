using Core.Stores;

public class BaseResponse<T>
{
    public string? Message { get; set; }
    public T? Data { get; set; }
    public StatusCodeHelper StatusCodeHelper { get; set; }
    public string? Code { get; set; }
    public BaseResponse(StatusCodeHelper statusCodeHelper, string code, string? message, T? data)
    {
        StatusCodeHelper = statusCodeHelper;
        Code = code;
        Message = message;
        Data = data;
    }
    public BaseResponse(StatusCodeHelper statusCodeHelper, string code, string? message)
    {
        StatusCodeHelper = statusCodeHelper;
        Code = code;
        Message = message;
    }
    public BaseResponse(StatusCodeHelper statusCodeHelper, string code, T data)
    {
        StatusCodeHelper = statusCodeHelper;
        Code = code;
        Data = data;
    }
    public static BaseResponse<T> OkResponse(string message)
    {
        return new BaseResponse<T>(StatusCodeHelper.Success, "Success", message);
    }
    public static BaseResponse<T> OkResponse(T data)
    {
        return new BaseResponse<T>(StatusCodeHelper.Success, "Success", data);
    }
    public static BaseResponse<T> CreatedResponse(string message)
    {
        return new BaseResponse<T>(StatusCodeHelper.Created, "Created", message);
    }
    public static BaseResponse<T> CreatedResponse(T data)
    {
        return new BaseResponse<T>(StatusCodeHelper.Created, "Created", data);
    }
}