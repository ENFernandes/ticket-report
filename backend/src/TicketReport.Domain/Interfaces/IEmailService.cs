namespace TicketReport.Domain.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendTicketNotificationAsync(string to, string ticketTitle, string messageContent, string senderName);
}
