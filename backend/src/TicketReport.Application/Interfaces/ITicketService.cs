using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Tickets;
using TicketReport.Domain.Enums;

namespace TicketReport.Application.Interfaces;

public interface ITicketService
{
    Task<Result<IEnumerable<TicketDto>>> GetTicketsAsync(Guid userId, UserRole userRole);
    Task<Result<TicketDto>> GetTicketByIdAsync(Guid ticketId, Guid userId, UserRole userRole);
    Task<Result<TicketDto>> CreateTicketAsync(CreateTicketRequest request, Guid reporterId);
    Task<Result<TicketDto>> UpdateStatusAsync(Guid ticketId, UpdateTicketStatusRequest request, Guid userId, UserRole userRole);
    Task<Result<TicketDto>> AssignTicketAsync(Guid ticketId, AssignTicketRequest request, Guid userId, UserRole userRole);
}
