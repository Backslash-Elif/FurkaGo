using System.ComponentModel.DataAnnotations;

namespace FurkaGoWebApi.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required, MaxLength(256)]
    public string Name { get; set; } = null!;

    // Plain-text for prototype. Later swap for hashed password.
    [Required, MaxLength(512)]
    public string Password { get; set; } = null!;
}