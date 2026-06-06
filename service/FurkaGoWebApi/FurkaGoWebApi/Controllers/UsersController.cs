using FurkaGoWebApi.Data;
using FurkaGoWebApi.Dto;
using FurkaGoWebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FurkaGoWebApi.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .AsNoTracking()
            .Select(u => new UserDto { Id = u.Id, Name = u.Name })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var u = await _db.Users.FindAsync(id);
        if (u == null) return NotFound();
        return Ok(new UserDto { Id = u.Id, Name = u.Name });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Password = dto.Password // prototype only; later store hashed
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = user.Id }, new { id = user.Id });
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