using TicketReport.Application.DTOs.Auth;
using TicketReport.Domain.Enums;

namespace TicketReport.Application.DTOs.Tickets;

public class TicketDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? AttachmentUrls { get; set; }
    public UserDto Reporter { get; set; } = null!;
    public UserDto? AssignedTo { get; set; }
    public List<MessageDto> Messages { get; set; } = new();
}

public class MessageDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDto User { get; set; } = null!;
}
