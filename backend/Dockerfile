FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/TicketReport.Domain/TicketReport.Domain.csproj", "TicketReport.Domain/"]
COPY ["src/TicketReport.Application/TicketReport.Application.csproj", "TicketReport.Application/"]
COPY ["src/TicketReport.Infrastructure/TicketReport.Infrastructure.csproj", "TicketReport.Infrastructure/"]
COPY ["src/TicketReport.API/TicketReport.API.csproj", "TicketReport.API/"]

RUN dotnet restore "TicketReport.API/TicketReport.API.csproj"

COPY src/ .

WORKDIR "/src/TicketReport.API"
RUN dotnet build "TicketReport.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TicketReport.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TicketReport.API.dll"]
