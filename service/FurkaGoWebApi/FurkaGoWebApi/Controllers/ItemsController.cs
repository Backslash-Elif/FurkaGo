using FurkaGoWebApi.Data;
using FurkaGoWebApi.Models;
using Microsoft.AspNetCore.Authorization;
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
        return Ok(await _db.Items.Select(i => new
        {
            i.Id, i.Name, i.Info, i.Tech,
            i.Quiz
        }).ToListAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var it = await _db.Items.FindAsync(id);
        if (it == null) return NotFound();
        return Ok(new
        {
            it.Id, it.Name, it.Info, it.Tech,
            it.Quiz
        });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] ItemCreateDto dto)
    {
        var item = new Item
            { Id = Guid.NewGuid(), Name = dto.Name, Info = dto.Info, Tech = dto.TechJson, Quiz = dto.QuizJson };

        if (dto.Photo != null && dto.Photo.Length > 0)
        {
            using var ms = new MemoryStream();
            await dto.Photo.CopyToAsync(ms);
            item.Photo = ms.ToArray();
        }

        _db.Items.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, new { item.Id });
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Patch(Guid id, [FromForm] ItemPatchDto dto)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return NotFound();
        if (dto.Name != null) item.Name = dto.Name;
        if (dto.Info != null) item.Info = dto.Info;
        if (dto.TechJson != null) item.Tech = dto.TechJson;
        if (dto.QuizJson != null) item.Quiz = dto.QuizJson;
        if (dto.Photo != null)
        {
            using var ms = new MemoryStream();
            await dto.Photo.CopyToAsync(ms);
            item.Photo = ms.ToArray();
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var it = await _db.Items.FindAsync(id);
        if (it == null) return NotFound();
        _db.Items.Remove(it);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // optional: return photo
    [HttpGet("{id:guid}/photo")]
    public async Task<IActionResult> GetPhoto(Guid id)
    {
        var it = await _db.Items.FindAsync(id);
        if (it == null || it.Photo == null) return NotFound();
        return File(it.Photo, "image/jpeg"); // or detect mime
    }
}

public class ItemCreateDto
{
    public string Name { get; set; }
    public string Info { get; set; }
    public string TechJson { get; set; } // accept JSON as string
    public string QuizJson { get; set; }
    public IFormFile Photo { get; set; }
}

public class ItemPatchDto
{
    public string Name { get; set; }
    public string Info { get; set; }
    public string TechJson { get; set; }
    public string QuizJson { get; set; }
    public IFormFile Photo { get; set; }
}