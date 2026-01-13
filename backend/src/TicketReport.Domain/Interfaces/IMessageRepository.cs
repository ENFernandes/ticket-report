using TicketReport.Domain.Entities;

namespace TicketReport.Domain.Interfaces;

public interface IMessageRepository
{
    Task<Message?> GetByIdAsync(Guid id);
    Task<IEnumerable<Message>> GetByTicketIdAsync(Guid ticketId);
    Task<Message> AddAsync(Message message);
}
