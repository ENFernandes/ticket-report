using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Messages;
using TicketReport.Application.DTOs.Tickets;
using TicketReport.Domain.Enums;

namespace TicketReport.Application.Interfaces;

public interface IMessageService
{
    Task<Result<MessageDto>> AddMessageAsync(Guid ticketId, CreateMessageRequest request, Guid userId, UserRole userRole);
}
