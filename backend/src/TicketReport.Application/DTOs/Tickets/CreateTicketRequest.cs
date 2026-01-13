using System.ComponentModel.DataAnnotations;

namespace TicketReport.Application.DTOs.Tickets;

public class CreateTicketRequest
{
    [Required]
    [StringLength(200, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public Guid? AssignedToId { get; set; }

    /// <summary>
    /// URLs de anexos separados por vírgula (opcional)
    /// </summary>
    public string? AttachmentUrls { get; set; }
}

public class AssignTicketRequest
{
    public Guid? AssignedToId { get; set; }
}
