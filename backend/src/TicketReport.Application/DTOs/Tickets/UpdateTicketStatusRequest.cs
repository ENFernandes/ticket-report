using System.ComponentModel.DataAnnotations;
using TicketReport.Domain.Enums;

namespace TicketReport.Application.DTOs.Tickets;

public class UpdateTicketStatusRequest
{
    [Required]
    public TicketStatus Status { get; set; }
}
