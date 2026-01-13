using TicketReport.Domain.Entities;

namespace TicketReport.Domain.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
