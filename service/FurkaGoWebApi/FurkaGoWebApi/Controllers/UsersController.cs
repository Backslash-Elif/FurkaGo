using FurkaGoWebApi.Data;
using FurkaGoWebApi.Helpers;
using FurkaGoWebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FurkaGoWebApi.Controllers;

[ApiController]
[Route("users")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.Users.Select(u => new { u.Id, u.Name }).ToListAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        return Ok(new { u.Id, u.Name });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var exists = await _db.Users.AnyAsync(x => x.Name == dto.Name);
        if (exists) return Conflict("User exists");
        var user = new User
        {
            Id = Guid.NewGuid(), Name = dto.Name, PasswordHash = Security.HashPassword(dto.Password),
            IsAdmin = dto.IsAdmin
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = user.Id }, new { user.Id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        _db.Users.Remove(u);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateUserDto
{
    public string Name { get; set; }
    public string Password { get; set; }
    public bool IsAdmin { get; set; } = true;
}