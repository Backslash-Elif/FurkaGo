using System.Text;
using FurkaGoWebApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// DB
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(config.GetConnectionString("DefaultConnection")));

// JWT (example symmetric key in appsettings; use secure secret in prod)
// var jwtSecret = config["Jwt:Key"] ?? "replace_this_with_secure_key_very_long";
// var key = Encoding.ASCII.GetBytes(jwtSecret);

// builder.Services.AddAuthentication(options =>
//     {
//         options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//         options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//     })
//     .AddJwtBearer(options =>
//     {
//         options.RequireHttpsMetadata = false;
//         options.SaveToken = true;
//         options.TokenValidationParameters = new TokenValidationParameters
//         {
//             ValidateIssuerSigningKey = true,
//             IssuerSigningKey = new SymmetricSecurityKey(key),
//             ValidateIssuer = false,
//             ValidateAudience = false
//         };
//     });

// simple admin policy
// builder.Services.AddAuthorization(options =>
// {
//     options.AddPolicy("AdminOnly", policy => policy.RequireClaim("isAdmin", "true"));
// });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

// Run DB check + migrate logic on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        var env = services.GetRequiredService<IWebHostEnvironment>();

        // Try apply migrations normally first
        try
        {
            logger.LogInformation("Attempting to apply pending migrations...");
            await db.Database.MigrateAsync();
            logger.LogInformation("Migrations applied successfully.");
        }
        catch (Exception migEx)
        {
            logger.LogError(migEx, "Applying migrations failed.");

            if (env.IsDevelopment())
            {
                logger.LogWarning("Development environment detected — dropping and re-creating database.");
                try
                {
                    await db.Database.EnsureDeletedAsync();
                    logger.LogInformation("Database dropped.");
                    await db.Database.MigrateAsync();
                    logger.LogInformation("Database re-created and migrations applied.");
                }
                catch (Exception recreateEx)
                {
                    logger.LogCritical(recreateEx, "Failed to drop and recreate the database in Development. Exiting.");
                    throw; // fatal
                }
            }
            else
            {
                logger.LogCritical("Production environment — migration failure is fatal. Exiting.");
                throw; // fatal in production
            }
        }

        // Optional: detect model-database compatibility by checking pending migrations after MigrateAsync
        // If any pending migrations remain (unexpected), treat similar to migration failure.
        var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();
        if (pending.Any())
        {
            logger.LogWarning("Pending migrations remain after migration attempt: {count}", pending.Count);
            if (env.IsDevelopment())
            {
                logger.LogWarning("Development: dropping and re-creating DB to apply all migrations.");
                try
                {
                    await db.Database.EnsureDeletedAsync();
                    await db.Database.MigrateAsync();
                    logger.LogInformation("Database re-created and migrations applied.");
                }
                catch (Exception ex)
                {
                    logger.LogCritical(ex, "Failed to drop and recreate DB after pending migrations check. Exiting.");
                    throw;
                }
            }
            else
            {
                logger.LogCritical("Production: pending migrations detected — aborting startup.");
                throw new InvalidOperationException("Pending migrations detected in production. Aborting.");
            }
        }
    }
    catch (Exception ex)
    {
        // If we reach here startup should fail
        var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
        loggerFactory.CreateLogger("Startup").LogCritical(ex, "Database initialization failed. Application will terminate.");
        throw;
    }
}

app.MapOpenApi();
app.MapScalarApiReference();

// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();