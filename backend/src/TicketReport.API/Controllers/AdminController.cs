using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketReport.Application.DTOs.Admin;
using TicketReport.Application.Interfaces;
using TicketReport.Domain.Enums;

namespace TicketReport.API.Controllers;

[ApiController]
[Route("admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _adminService.GetUsersAsync();

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Data);
    }

    [HttpGet("resolvers")]
    public async Task<IActionResult> GetResolvers()
    {
        var result = await _adminService.GetResolversAsync();

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Data);
    }

    [HttpPost("users/{id:guid}/approve")]
    public async Task<IActionResult> ApproveUser(Guid id)
    {
        var result = await _adminService.ApproveUserAsync(id);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok();
    }

    [HttpPatch("users/{id:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var result = await _adminService.UpdateUserRoleAsync(id, request.Role);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok();
    }

    [HttpPost("users/{id:guid}/reset-password")]
    public async Task<IActionResult> ResetUserPassword(Guid id)
    {
        var result = await _adminService.ResetUserPasswordAsync(id);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Data);
    }
}
