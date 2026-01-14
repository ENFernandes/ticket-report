using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Admin;
using TicketReport.Application.DTOs.Auth;
using TicketReport.Application.Interfaces;
using TicketReport.Domain.Enums;
using TicketReport.Domain.Interfaces;

namespace TicketReport.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public AdminService(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<IEnumerable<UserDto>>> GetUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return Result<IEnumerable<UserDto>>.Success(users.Select(MapToUserDto));
    }

    public async Task<Result<IEnumerable<UserDto>>> GetResolversAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var resolvers = users.Where(u => u.Role == UserRole.Admin || u.Role == UserRole.UserResolve);
        return Result<IEnumerable<UserDto>>.Success(resolvers.Select(MapToUserDto));
    }

    public async Task<Result<object>> ApproveUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return Result<object>.Failure("Utilizador não encontrado.");

        // Por enquanto, apenas valida que o utilizador existe
        // Se no futuro houver um campo IsApproved, pode ser atualizado aqui
        return Result<object>.Success(null!);
    }

    public async Task<Result<object>> UpdateUserRoleAsync(Guid userId, UserRole role)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return Result<object>.Failure("Utilizador não encontrado.");

        user.Role = role;
        await _userRepository.UpdateAsync(user);

        return Result<object>.Success(null!);
    }

    public async Task<Result<ResetPasswordResponse>> ResetUserPasswordAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return Result<ResetPasswordResponse>.Failure("Utilizador não encontrado.");

        // Gera uma password temporária aleatória
        var temporaryPassword = GenerateTemporaryPassword();
        user.PasswordHash = _passwordHasher.Hash(temporaryPassword);
        
        await _userRepository.UpdateAsync(user);

        return Result<ResetPasswordResponse>.Success(new ResetPasswordResponse
        {
            TemporaryPassword = temporaryPassword
        });
    }

    private static string GenerateTemporaryPassword()
    {
        // Gera uma password temporária de 12 caracteres
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 12)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    private static UserDto MapToUserDto(Domain.Entities.User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role.ToString()
    };
}
