using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace FurkaGoWebApi.Models;

public class Item
{
    [Key]
    public Guid Id { get; set; }

    [Required, MaxLength(256)]
    public string Name { get; set; } = null!;

    [MaxLength(1000)]
    public string? Info { get; set; }

    // Stored as JSON string in DB, exposed as JsonDocument
    public string? TechJson { get; set; }

    public string? QuizJson { get; set; }

    // Photo stored as varbinary(max)
    public byte[]? Photo { get; set; }

    [NotMapped]
    public JsonDocument? Tech
    {
        get => TechJson is null ? null : JsonDocument.Parse(TechJson);
        set => TechJson = value is null ? null : JsonSerializer.Serialize(value);
    }

    [NotMapped]
    public JsonDocument? Quiz
    {
        get => QuizJson is null ? null : JsonDocument.Parse(QuizJson);
        set => QuizJson = value is null ? null : JsonSerializer.Serialize(value);
    }
}