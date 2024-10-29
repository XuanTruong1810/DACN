
namespace Core.Stores
{
    public enum StatusCodeHelper
    {
        Success = 200,
        Created = 201,
        BadRequest = 400,
        Unauthorized = 401,
        Forbidden = 403,
        NotFound = 404,
        Conflict = 409,
        InternalServerError = 500,
        ServiceUnavailable = 503
    }
}