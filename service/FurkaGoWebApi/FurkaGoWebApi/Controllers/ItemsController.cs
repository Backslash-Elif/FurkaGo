using System.Text.Json;
using FurkaGoWebApi.Data;
using FurkaGoWebApi.Dto;
using FurkaGoWebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FurkaGoWebApi.Controllers;

[ApiController]
[Route("items")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ItemsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _db.Items
            .AsNoTracking()
            .Select(i => new ItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Info = i.Info,
                Tech = i.TechJson == null ? null : JsonDocument.Parse(i.TechJson),
                Quiz = i.QuizJson == null ? null : JsonDocument.Parse(i.QuizJson),
                Photo = i.Photo
            }).ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var i = await _db.Items.FindAsync(id);
        if (i == null) return NotFound();
        var dto = new ItemDto
        {
            Id = i.Id,
            Name = i.Name,
            Info = i.Info,
            Tech = i.TechJson is null ? null : JsonDocument.Parse(i.TechJson),
            Quiz = i.QuizJson is null ? null : JsonDocument.Parse(i.QuizJson),
            Photo = i.Photo
        };
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ItemDto dto)
    {
        var item = new Item
        {
            Id = dto.Id ?? Guid.NewGuid(),
            Name = dto.Name,
            Info = dto.Info,
            TechJson = dto.Tech is null ? null : JsonSerializer.Serialize(dto.Tech),
            QuizJson = dto.Quiz is null ? null : JsonSerializer.Serialize(dto.Quiz),
            Photo = dto.Photo
        };
        _db.Items.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, new { id = item.Id });
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Patch(Guid id, [FromBody] ItemDto dto)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return NotFound();

        // Apply partial updates (only non-null fields from DTO)
        if (dto.Name != null) item.Name = dto.Name;
        if (dto.Info != null) item.Info = dto.Info;
        if (dto.Tech != null) item.TechJson = JsonSerializer.Serialize(dto.Tech);
        if (dto.Quiz != null) item.QuizJson = JsonSerializer.Serialize(dto.Quiz);
        if (dto.Photo != null) item.Photo = dto.Photo;

        _db.Items.Update(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return NotFound();
        _db.Items.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}