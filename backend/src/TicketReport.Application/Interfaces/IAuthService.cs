using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Auth;

namespace TicketReport.Application.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
}
