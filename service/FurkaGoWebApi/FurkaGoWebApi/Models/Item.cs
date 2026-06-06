using System.ComponentModel.DataAnnotations;

namespace FurkaGoWebApi.Models;

public class Item
{
    [Key] public Guid Id { get; set; }

    [Required] [MaxLength(200)] public string Name { get; set; }

    [MaxLength(1000)] public string Info { get; set; }

    // store JSON as string
    public string Tech { get; set; }

    public string Quiz { get; set; }

    // store image binary in DB
    public byte[] Photo { get; set; }
}