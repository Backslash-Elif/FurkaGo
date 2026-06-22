# FurkaGo
A modern digital tour for the Furka-Bergstrecke

## About
This Project is made up by its 3 components:
- Database
- Service
- Web UI

## Database
The database is a container of Microsoft SQL Server. To run it you need a container engine and a container compose provider. As of this time we recommend [Podman](https://podman.io/) with [Podman Compose](https://pypi.org/project/podman-compose/) (Hint: If you're using a managed python installation you might want to check out (Pipx)[https://pipx.pypa.io/stable/how-to/install-pipx/]).

> Note: the MSSQL container doesn't require a rootful container

## Service
The service is a typical ASP .NET project utilizing EFCore and .NET 10

## Web UI
Web UI runs on node.js. Specifically it's a stack of React.js, TypeScript, Next.js, TailwindCSS, HeroUi. Combining those Technologies allowed us to create a Fast, fluid, responsive and beautiful modern UI and UX.

## Dependencies
- DB:
  - Container runtime
  - Container compose provider
- Service:
  - .NET 10 SDK
- Web UI:
  - Node.js lts 22 or newer
  - Up to date version of npm

## How to run

Run:
- clone github
- in /db: podman-compose up -d #assuming you're using podman
- in /service/FurkaGoWebApi/FurkaGoWebApi: dotnet run
- in /web: npm install #don't worry, this might take upwards of 2-10 minutes and might be very CPU and memory intensive
- finally: /web: npm run dev