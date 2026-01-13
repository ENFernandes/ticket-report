using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketReport.Application.DTOs.Messages;
using TicketReport.Application.DTOs.Tickets;
using TicketReport.Application.Interfaces;
using TicketReport.Domain.Enums;

namespace TicketReport.API.Controllers;

[ApiController]
[Route("tickets")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly IMessageService _messageService;

    public TicketsController(ITicketService ticketService, IMessageService messageService)
    {
        _ticketService = ticketService;
        _messageService = messageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTickets()
    {
        var (userId, userRole) = GetUserClaims();
        var result = await _ticketService.GetTicketsAsync(userId, userRole);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTicket(Guid id)
    {
        var (userId, userRole) = GetUserClaims();
        var result = await _ticketService.GetTicketByIdAsync(id, userId, userRole);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var (userId, _) = GetUserClaims();
        var result = await _ticketService.CreateTicketAsync(request, userId);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetTicket), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,UserResolve")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusRequest request)
    {
        var (userId, userRole) = GetUserClaims();
        var result = await _ticketService.UpdateStatusAsync(id, request, userId, userRole);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Data);
    }

    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] CreateMessageRequest request)
    {
        var (userId, userRole) = GetUserClaims();
        var result = await _messageService.AddMessageAsync(id, request, userId, userRole);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Created("", result.Data);
    }

    [HttpPatch("{id:guid}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignTicket(Guid id, [FromBody] AssignTicketRequest request)
    {
        var (userId, userRole) = GetUserClaims();
        var result = await _ticketService.AssignTicketAsync(id, request, userId, userRole);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Data);
    }

    private (Guid userId, UserRole userRole) GetUserClaims()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

        var userId = Guid.Parse(userIdClaim!);
        var userRole = Enum.Parse<UserRole>(roleClaim!);

        return (userId, userRole);
    }
}
