using TicketReport.Domain.Enums;

namespace TicketReport.Application.DTOs.Admin;

public class UpdateUserRoleRequest
{
    public UserRole Role { get; set; }
}
