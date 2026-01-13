using TicketReport.Application.Common;
using TicketReport.Application.DTOs.Auth;
using TicketReport.Application.Interfaces;
using TicketReport.Domain.Entities;
using TicketReport.Domain.Interfaces;

namespace TicketReport.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IUserRepository userRepository,
        IJwtService jwtService,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            return Result<AuthResponse>.Failure("Credenciais inválidas.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result<AuthResponse>.Failure("Credenciais inválidas.");

        var token = _jwtService.GenerateToken(user);

        return Result<AuthResponse>.Success(new AuthResponse
        {
            Token = token,
            User = MapToUserDto(user)
        });
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepository.ExistsAsync(request.Email))
            return Result<AuthResponse>.Failure("Já existe um utilizador com este email.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        var token = _jwtService.GenerateToken(user);

        return Result<AuthResponse>.Success(new AuthResponse
        {
            Token = token,
            User = MapToUserDto(user)
        });
    }

    private static UserDto MapToUserDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role.ToString()
    };
}
