using FurkaGoWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FurkaGoWebApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

    public DbSet<Item> Items { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Map JSON properties to VARCHAR/NTEXT depending on preference.
        modelBuilder.Entity<Item>()
            .Property(i => i.TechJson)
            .HasColumnType("nvarchar(max)");

        modelBuilder.Entity<Item>()
            .Property(i => i.QuizJson)
            .HasColumnType("nvarchar(max)");

        modelBuilder.Entity<Item>()
            .Property(i => i.Photo)
            .HasColumnType("varbinary(max)");
    }
}