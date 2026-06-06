using System.Text.Json;

namespace FurkaGoWebApi.Dto;

public class ItemDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Info { get; set; }
    public JsonDocument? Tech { get; set; }
    public JsonDocument? Quiz { get; set; }
    public byte[]? Photo { get; set; }
}