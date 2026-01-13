using Microsoft.EntityFrameworkCore;
using TicketReport.Domain.Entities;
using TicketReport.Domain.Interfaces;
using TicketReport.Infrastructure.Data;

namespace TicketReport.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly ApplicationDbContext _context;

    public TicketRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Ticket?> GetByIdAsync(Guid id)
    {
        return await _context.Tickets
            .Include(t => t.Reporter)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Ticket?> GetByIdWithMessagesAsync(Guid id)
    {
        return await _context.Tickets
            .Include(t => t.Reporter)
            .Include(t => t.AssignedTo)
            .Include(t => t.Messages)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Ticket>> GetAllAsync()
    {
        return await _context.Tickets
            .Include(t => t.Reporter)
            .Include(t => t.AssignedTo)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByReporterIdAsync(Guid reporterId)
    {
        return await _context.Tickets
            .Include(t => t.Reporter)
            .Include(t => t.AssignedTo)
            .Where(t => t.ReporterId == reporterId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByAssignedToIdAsync(Guid assignedToId)
    {
        return await _context.Tickets
            .Include(t => t.Reporter)
            .Include(t => t.AssignedTo)
            .Where(t => t.AssignedToId == assignedToId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByReporterOrAssignedAsync(Guid userId)
    {
        return await _context.Tickets
            .Include(t => t.Reporter)
            .Include(t => t.AssignedTo)
            .Where(t => t.ReporterId == userId || t.AssignedToId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Ticket> AddAsync(Ticket ticket)
    {
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task UpdateAsync(Ticket ticket)
    {
        _context.Tickets.Update(ticket);
        await _context.SaveChangesAsync();
    }
}
