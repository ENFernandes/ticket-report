using System.ComponentModel.DataAnnotations;

namespace TicketReport.Application.DTOs.Messages;

public class CreateMessageRequest
{
    [Required]
    public string Content { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }
}
