using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Auth;
using TicketReport.Application.DTOs.Messages;
using TicketReport.Application.DTOs.Tickets;
using TicketReport.Application.Interfaces;
using TicketReport.Domain.Entities;
using TicketReport.Domain.Enums;
using TicketReport.Domain.Interfaces;

namespace TicketReport.Application.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public MessageService(
        IMessageRepository messageRepository,
        ITicketRepository ticketRepository,
        IUserRepository userRepository,
        IEmailService emailService)
    {
        _messageRepository = messageRepository;
        _ticketRepository = ticketRepository;
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<Result<MessageDto>> AddMessageAsync(Guid ticketId, CreateMessageRequest request, Guid userId, UserRole userRole)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null)
            return Result<MessageDto>.Failure("Ticket não encontrado.");

        if (!CanAccessTicket(ticket, userId, userRole))
            return Result<MessageDto>.Failure("Não tem permissão para adicionar mensagens a este ticket.");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return Result<MessageDto>.Failure("Utilizador não encontrado.");

        var message = new Message
        {
            Id = Guid.NewGuid(),
            TicketId = ticketId,
            Ticket = ticket,
            UserId = userId,
            User = user,
            Content = request.Content,
            AttachmentUrl = request.AttachmentUrl,
            CreatedAt = DateTime.UtcNow
        };

        await _messageRepository.AddAsync(message);

        await NotifyParticipantsAsync(ticket, message, user);

        return Result<MessageDto>.Success(new MessageDto
        {
            Id = message.Id,
            Content = message.Content,
            AttachmentUrl = message.AttachmentUrl,
            CreatedAt = message.CreatedAt,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString()
            }
        });
    }

    private async Task NotifyParticipantsAsync(Ticket ticket, Message message, User sender)
    {
        var recipientsEmails = new HashSet<string>();

        if (ticket.Reporter.Email != sender.Email)
            recipientsEmails.Add(ticket.Reporter.Email);

        if (ticket.AssignedTo != null && ticket.AssignedTo.Email != sender.Email)
            recipientsEmails.Add(ticket.AssignedTo.Email);

        foreach (var email in recipientsEmails)
        {
            await _emailService.SendTicketNotificationAsync(
                email,
                ticket.Title,
                message.Content,
                sender.Name);
        }
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
}
