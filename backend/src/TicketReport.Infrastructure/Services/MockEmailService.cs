using Microsoft.Extensions.Logging;
using TicketReport.Domain.Interfaces;

namespace TicketReport.Infrastructure.Services;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation(
            "[MOCK EMAIL] To: {To} | Subject: {Subject} | Body: {Body}",
            to, subject, body);
        return Task.CompletedTask;
    }

    public Task SendTicketNotificationAsync(string to, string ticketTitle, string messageContent, string senderName)
    {
        var subject = $"Nova mensagem no ticket: {ticketTitle}";
        var body = $"O utilizador {senderName} adicionou uma mensagem:\n\n{messageContent}";
        
        return SendEmailAsync(to, subject, body);
    }
}
