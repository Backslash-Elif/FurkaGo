using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FurkaGoWebApi.Data;
using FurkaGoWebApi.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FurkaGoWebApi.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Name == dto.Name);
        if (user == null || !Security.VerifyPassword(dto.Password, user.PasswordHash)) return Unauthorized();

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("isAdmin", user.IsAdmin ? "true" : "false"),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        );
        return Ok(new { token = tokenHandler.WriteToken(token) });
    }
}

public class LoginDto
{
    public string Name { get; set; }
    public string Password { get; set; }
}