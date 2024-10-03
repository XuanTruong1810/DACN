using Core.Stores;

public class BaseException(StatusCodeHelper statusCode, string errorCode, string message) : Exception(message)
{
    public StatusCodeHelper StatusCodeHelper { get; set; } = statusCode;
    public string ErrorCode { get; set; } = errorCode;
}