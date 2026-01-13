using TicketReport.Domain.Enums;

namespace TicketReport.Domain.Entities;

public class Ticket
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; } = TicketStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    /// <summary>
    /// URLs de anexos do ticket (separados por vírgula)
    /// </summary>
    public string? AttachmentUrls { get; set; }

    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }

    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
