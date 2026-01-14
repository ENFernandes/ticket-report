using Microsoft.Extensions.DependencyInjection;
using TicketReport.Application.Interfaces;
using TicketReport.Application.Services;

namespace TicketReport.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IAdminService, AdminService>();

        return services;
    }
}
