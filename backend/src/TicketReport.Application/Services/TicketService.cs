using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Auth;
using TicketReport.Application.DTOs.Tickets;
using TicketReport.Application.Interfaces;
using TicketReport.Domain.Entities;
using TicketReport.Domain.Enums;
using TicketReport.Domain.Interfaces;

namespace TicketReport.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IUserRepository _userRepository;

    public TicketService(ITicketRepository ticketRepository, IUserRepository userRepository)
    {
        _ticketRepository = ticketRepository;
        _userRepository = userRepository;
    }

    public async Task<Result<IEnumerable<TicketDto>>> GetTicketsAsync(Guid userId, UserRole userRole)
    {
        IEnumerable<Ticket> tickets = userRole switch
        {
            UserRole.Admin => await _ticketRepository.GetAllAsync(),
            UserRole.UserReport => await _ticketRepository.GetByReporterIdAsync(userId),
            UserRole.UserResolve => await _ticketRepository.GetByReporterOrAssignedAsync(userId),
            _ => Enumerable.Empty<Ticket>()
        };

        return Result<IEnumerable<TicketDto>>.Success(tickets.Select(MapToTicketDto));
    }

    public async Task<Result<TicketDto>> GetTicketByIdAsync(Guid ticketId, Guid userId, UserRole userRole)
    {
        var ticket = await _ticketRepository.GetByIdWithMessagesAsync(ticketId);
        if (ticket == null)
            return Result<TicketDto>.Failure("Ticket não encontrado.");

        if (!CanAccessTicket(ticket, userId, userRole))
            return Result<TicketDto>.Failure("Não tem permissão para aceder a este ticket.");

        return Result<TicketDto>.Success(MapToTicketDto(ticket));
    }

    public async Task<Result<TicketDto>> CreateTicketAsync(CreateTicketRequest request, Guid reporterId)
    {
        var reporter = await _userRepository.GetByIdAsync(reporterId);
        if (reporter == null)
            return Result<TicketDto>.Failure("Utilizador não encontrado.");

        User? assignedTo = null;
        if (request.AssignedToId.HasValue)
        {
            assignedTo = await _userRepository.GetByIdAsync(request.AssignedToId.Value);
            if (assignedTo == null)
                return Result<TicketDto>.Failure("Utilizador para atribuição não encontrado.");

            if (assignedTo.Role != UserRole.UserResolve && assignedTo.Role != UserRole.Admin)
                return Result<TicketDto>.Failure("O ticket só pode ser atribuído a um Resolver ou Admin.");
        }

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Status = TicketStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            AttachmentUrls = request.AttachmentUrls,
            ReporterId = reporterId,
            Reporter = reporter,
            AssignedToId = request.AssignedToId,
            AssignedTo = assignedTo
        };

        await _ticketRepository.AddAsync(ticket);

        return Result<TicketDto>.Success(MapToTicketDto(ticket));
    }

    public async Task<Result<TicketDto>> UpdateStatusAsync(Guid ticketId, UpdateTicketStatusRequest request, Guid userId, UserRole userRole)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null)
            return Result<TicketDto>.Failure("Ticket não encontrado.");

        if (userRole == UserRole.UserReport)
            return Result<TicketDto>.Failure("Reporters não podem alterar o status de tickets.");

        if (userRole == UserRole.UserResolve)
        {
            if (ticket.AssignedToId != userId)
                return Result<TicketDto>.Failure("Só pode alterar o status de tickets que lhe foram atribuídos.");

            var validTransition = IsValidStatusTransition(ticket.Status, request.Status);
            if (!validTransition)
                return Result<TicketDto>.Failure($"Transição de status inválida: {ticket.Status} -> {request.Status}");
        }

        ticket.Status = request.Status;

        if (request.Status == TicketStatus.Resolved)
            ticket.ClosedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);

        return Result<TicketDto>.Success(MapToTicketDto(ticket));
    }

    public async Task<Result<TicketDto>> AssignTicketAsync(Guid ticketId, AssignTicketRequest request, Guid userId, UserRole userRole)
    {
        if (userRole != UserRole.Admin)
            return Result<TicketDto>.Failure("Apenas administradores podem atribuir tickets.");

        var ticket = await _ticketRepository.GetByIdWithMessagesAsync(ticketId);
        if (ticket == null)
            return Result<TicketDto>.Failure("Ticket não encontrado.");

        User? assignedTo = null;
        if (request.AssignedToId.HasValue)
        {
            assignedTo = await _userRepository.GetByIdAsync(request.AssignedToId.Value);
            if (assignedTo == null)
                return Result<TicketDto>.Failure("Utilizador para atribuição não encontrado.");

            if (assignedTo.Role != UserRole.UserResolve && assignedTo.Role != UserRole.Admin)
                return Result<TicketDto>.Failure("O ticket só pode ser atribuído a um Resolver ou Admin.");
        }

        ticket.AssignedToId = request.AssignedToId;
        ticket.AssignedTo = assignedTo;

        await _ticketRepository.UpdateAsync(ticket);

        return Result<TicketDto>.Success(MapToTicketDto(ticket));
    }

    private static bool IsValidStatusTransition(TicketStatus current, TicketStatus next)
    {
        return (current, next) switch
        {
            (TicketStatus.Pending, TicketStatus.InProgress) => true,
            (TicketStatus.InProgress, TicketStatus.FinalAnalysis) => true,
            (TicketStatus.FinalAnalysis, TicketStatus.Resolved) => true,
            _ => false
        };
    }

    private static bool CanAccessTicket(Ticket ticket, Guid userId, UserRole userRole)
    {
        return userRole switch
        {
            UserRole.Admin => true,
            UserRole.UserReport => ticket.ReporterId == userId,
            UserRole.UserResolve => ticket.ReporterId == userId || ticket.AssignedToId == userId,
            _ => false
        };
    }

    private static TicketDto MapToTicketDto(Ticket ticket) => new()
    {
        Id = ticket.Id,
        Title = ticket.Title,
        Description = ticket.Description,
        Status = ticket.Status,
        CreatedAt = ticket.CreatedAt,
        ClosedAt = ticket.ClosedAt,
        AttachmentUrls = ticket.AttachmentUrls,
        Reporter = new UserDto
        {
            Id = ticket.Reporter.Id,
            Name = ticket.Reporter.Name,
            Email = ticket.Reporter.Email,
            Role = ticket.Reporter.Role.ToString()
        },
        AssignedTo = ticket.AssignedTo != null ? new UserDto
        {
            Id = ticket.AssignedTo.Id,
            Name = ticket.AssignedTo.Name,
            Email = ticket.AssignedTo.Email,
            Role = ticket.AssignedTo.Role.ToString()
        } : null,
        Messages = ticket.Messages.Select(m => new MessageDto
        {
            Id = m.Id,
            Content = m.Content,
            AttachmentUrl = m.AttachmentUrl,
            CreatedAt = m.CreatedAt,
            User = new UserDto
            {
                Id = m.User.Id,
                Name = m.User.Name,
                Email = m.User.Email,
                Role = m.User.Role.ToString()
            }
        }).ToList()
    };
}
