using TicketReport.Domain.Entities;

namespace TicketReport.Domain.Interfaces;

public interface ITicketRepository
{
    Task<Ticket?> GetByIdAsync(Guid id);
    Task<Ticket?> GetByIdWithMessagesAsync(Guid id);
    Task<IEnumerable<Ticket>> GetAllAsync();
    Task<IEnumerable<Ticket>> GetByReporterIdAsync(Guid reporterId);
    Task<IEnumerable<Ticket>> GetByAssignedToIdAsync(Guid assignedToId);
    Task<IEnumerable<Ticket>> GetByReporterOrAssignedAsync(Guid userId);
    Task<Ticket> AddAsync(Ticket ticket);
    Task UpdateAsync(Ticket ticket);
}
