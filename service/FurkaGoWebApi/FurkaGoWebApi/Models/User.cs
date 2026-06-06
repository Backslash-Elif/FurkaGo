using System.ComponentModel.DataAnnotations;

namespace FurkaGoWebApi.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; }

    // store password hash (see notes)
    [Required]
    public string PasswordHash { get; set; }

    // simple admin flag
    public bool IsAdmin { get; set; } = true;
}