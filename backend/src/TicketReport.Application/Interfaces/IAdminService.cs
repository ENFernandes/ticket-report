using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Admin;
using TicketReport.Application.DTOs.Auth;
using TicketReport.Domain.Enums;

namespace TicketReport.Application.Interfaces;

public interface IAdminService
{
    Task<Result<IEnumerable<UserDto>>> GetUsersAsync();
    Task<Result<IEnumerable<UserDto>>> GetResolversAsync();
    Task<Result<object>> ApproveUserAsync(Guid userId);
    Task<Result<object>> UpdateUserRoleAsync(Guid userId, UserRole role);
    Task<Result<ResetPasswordResponse>> ResetUserPasswordAsync(Guid userId);
}
