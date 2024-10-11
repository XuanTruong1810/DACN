FROM mcr.microsoft.com/dotnet/core/sdk:8.0 AS build
WORKDIR /app

COPY *.sln .
COPY aspnetapp/*.csproj ./aspnetapp/
RUN dotnet restore

COPY aspnetapp/. ./aspnetapp/
WORKDIR /app/aspnetapp
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/core/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/aspnetapp/out ./
ENTRYPOINT ["dotnet", "aspnetapp.dll"]