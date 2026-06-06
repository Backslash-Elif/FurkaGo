using FurkaGoWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FurkaGoWebApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) {}

    public DbSet<Item> Items { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Item>().Property(i => i.Tech).HasColumnType("nvarchar(max)");
        mb.Entity<Item>().Property(i => i.Quiz).HasColumnType("nvarchar(max)");
        mb.Entity<User>().Property(u => u.PasswordHash).HasColumnName("Password");
    }
}