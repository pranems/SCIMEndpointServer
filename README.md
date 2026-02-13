# ✨ SCIMServer

**SCIM 2.0 provisioning monitor for Microsoft Entra ID — deploy in minutes, understand events instantly.**

[![Version 0.9.1](https://img.shields.io/badge/version-0.9.1-2ea043?style=flat-square)](https://github.com/pranems/SCIMServer/releases/latest) [![SCIM 2.0](https://img.shields.io/badge/SCIM-2.0-00a1f1?style=flat-square)](https://scim.cloud/) [![Microsoft Entra](https://img.shields.io/badge/Microsoft-Entra_ID-ff6b35?style=flat-square)](https://entra.microsoft.com/) [![License: MIT](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)](LICENSE)

SCIMServer turns raw SCIM provisioning JSON into clean, human-readable messages and provides a fast searchable web dashboard for users, groups, diffs, and backup state.

<img width="1224" height="995" alt="SCIMServer Dashboard" src="https://github.com/user-attachments/assets/2ec5a4f2-1e23-4440-a317-6562e0961a5a" />

---

## Key Features

| Feature | Description |
|---|---|
| 🧠 **Human Event Translation** | "Alice added to Finance Group" instead of opaque PATCH JSON |
| 🔍 **Searchable Activity Feed** | Filter & inspect SCIM requests and responses |
| 👥 **User & Group Browser** | View memberships & derived identifiers |
| 🔔 **Visual Change Alerts** | Favicon + tab badge for new provisioning activity |
| 💾 **Blob Snapshot Persistence** | Fast local SQLite + periodic blob snapshots to Azure Storage |
| 🔐 **Shared Secret + OAuth Auth** | Bearer token and OAuth2 client_credentials support |
| 🌐 **Multi-Endpoint Support** | Isolated SCIM endpoints per Entra app or tenant |
| 🌗 **Dark / Light Theme** | Clean responsive UI with theme toggle |
| 🚀 **Scale to Zero** | Minimal idle cost on Azure Container Apps |

---

## Quick Deploy to Azure (5 minutes)

Run in PowerShell (Windows 5.1+ or PowerShell 7+ on macOS/Linux). The script prompts for Resource Group, App Name, Region, and Secret — or auto-generates them.

```powershell
iex (iwr https://raw.githubusercontent.com/pranems/SCIMServer/master/bootstrap.ps1).Content
```

**Output** (save these — they are not stored anywhere else):
- ✅ Public URL (web UI + SCIM endpoint)
- 🔑 SCIM Bearer Token
- 🔑 JWT Signing Secret
- 🔑 OAuth Client Secret

<img width="1144" height="111" alt="Deployment output" src="https://github.com/user-attachments/assets/fe47af5a-2e1f-451b-a9e4-492ae704646f" />

**Azure resources created:**

<img width="468" height="328" alt="Azure resources" src="https://github.com/user-attachments/assets/6d99026d-7ba2-4ea1-b9bd-bea037ec6001" />

> **Cost**: ~$13–28/month (scales to zero when idle). See [full cost breakdown](docs/AZURE_DEPLOYMENT_AND_USAGE_GUIDE.md#9-cost-estimate).

### Alternative: Deploy with Parameters

```powershell
git clone https://github.com/pranems/SCIMServer.git
cd SCIMServer
.\scripts\deploy-azure.ps1 -ResourceGroup "scimserver-rg" -AppName "scimserver-prod" -ScimSecret "your-secret"
```

> 📘 **Full deployment guide** with architecture diagrams, step-by-step walkthrough, and parameter reference: [docs/AZURE_DEPLOYMENT_AND_USAGE_GUIDE.md](docs/AZURE_DEPLOYMENT_AND_USAGE_GUIDE.md)

---

## Configure Microsoft Entra Provisioning

### 1. Create Enterprise Application

Azure Portal → **Microsoft Entra ID** → **Enterprise Applications** → **+ New application** → **Create your own** → "Integrate any other application"

<img width="1678" height="704" alt="Create Enterprise App" src="https://github.com/user-attachments/assets/4cd0c21b-a637-4886-a787-ab932b900bcc" />

### 2. Configure SCIM Provisioning

Open your app → **Provisioning** → **Get started** → Set mode to **Automatic**:

| Field | Value |
|---|---|
| **Tenant URL** | `https://<your-app-url>/scim/v2` |
| **Secret Token** | Your SCIM secret from deployment output |

<img width="1108" height="592" alt="SCIM Configuration" src="https://github.com/user-attachments/assets/26e4a213-1617-4166-a8fa-4a614491bfe1" />

### 3. Test & Activate

1. Click **Test Connection** → expect ✅ success
2. Configure attribute mappings as needed
3. **Provisioning Status** → **On**
4. **Assign users/groups** to the Enterprise App

### 4. Monitor

Open your app URL (same host, no `/scim`) to watch events in real-time.

> **Important**: Copy the SCIM, JWT, and OAuth secrets shown at deployment time. They are not stored anywhere else.

---

## Architecture

```
┌─────────────────────┐       SCIM 2.0 / HTTPS       ┌──────────────────────────┐
│  Microsoft Entra ID │ ─────────────────────────────▶ │   Azure Container Apps   │
│  (Provisioning)     │ ◀───────────────────────────── │   SCIMServer             │
└─────────────────────┘                                └────────────┬─────────────┘
                                                                    │ blob snapshots
                                                       ┌────────────▼─────────────┐
                                                       │   Azure Blob Storage     │
                                                       │   (Private Endpoint)     │
                                                       └──────────────────────────┘
```

**Stack**: NestJS (Node.js 22) · Prisma + SQLite · React + Vite · Azure Container Apps · Bicep IaC

**Container image**: `ghcr.io/pranems/scimserver:latest`

---

## Updating

The web dashboard notifies you when a new version is available:

```powershell
iex (irm https://raw.githubusercontent.com/pranems/SCIMServer/master/scripts/update-scimserver-func.ps1); `
  Update-SCIMServer -Version v0.9.1
```

Or specify explicitly:
```powershell
Update-SCIMServer -Version v0.9.1 -ResourceGroup scimserver-rg -AppName scimserver-prod
```

> Since v0.8.13, the update script auto-generates `JWT_SECRET` and `OAUTH_CLIENT_SECRET` if missing. To rotate secrets, redeploy using the bootstrap one-liner.

---

## Local Development

```powershell
git clone https://github.com/pranems/SCIMServer.git
cd SCIMServer

# API (terminal 1)
cd api && npm install && npx prisma generate && npx prisma migrate dev && npm run start:dev

# Web UI (terminal 2)
cd web && npm install && npm run dev
```

- **API**: http://localhost:3000/scim
- **Web UI**: http://localhost:5173

See [DEPLOYMENT.md](DEPLOYMENT.md) for full local setup, Docker, and environment configuration.

---

## Docker

```yaml
version: '3.8'
services:
  scimserver:
    image: ghcr.io/pranems/scimserver:latest
    ports:
      - "3000:80"
    environment:
      - SCIM_SHARED_SECRET=your-secret
      - JWT_SECRET=your-jwt-secret
      - OAUTH_CLIENT_SECRET=your-oauth-secret
      - DATABASE_URL=file:/tmp/local-data/scim.db
    volumes:
      - scim-data:/app/data
volumes:
  scim-data:
```

```powershell
docker-compose up -d
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Test Connection fails | Ensure URL ends with `/scim/v2` and secret matches Entra config |
| No events appear | Turn provisioning ON; assign a user/group; wait for initial sync |
| Deploy script exits | Run `az login`; verify Azure CLI and subscription access |
| Data lost after restart | Check blob backup status in dashboard; verify managed identity role |
| Favicon badge missing | Trigger an event; clear browser cache if stale |

---

## Documentation

| Document | Description |
|---|---|
| [Azure Deployment & Usage Guide](docs/AZURE_DEPLOYMENT_AND_USAGE_GUIDE.md) | Complete Azure walkthrough with diagrams |
| [Deployment Options](DEPLOYMENT.md) | Azure, Docker, and local deployment |
| [API Reference](docs/COMPLETE_API_REFERENCE.md) | Full endpoint documentation |
| [SCIM Compliance](docs/SCIM_COMPLIANCE.md) | RFC compliance details |
| [Multi-Endpoint Guide](docs/MULTI_ENDPOINT_GUIDE.md) | Multi-endpoint configuration |

---

## Project Structure

```
SCIMServer/
├── api/                    # NestJS backend (SCIM 2.0 server)
│   ├── src/                #   TypeScript source
│   ├── prisma/             #   Database schema & migrations
│   └── public/             #   Built web assets
├── web/                    # React + Vite frontend
├── infra/                  # Bicep IaC templates
├── scripts/                # Deployment & management scripts
├── .github/workflows/      # CI/CD pipelines
├── Dockerfile              # Multi-stage container build
├── bootstrap.ps1           # One-liner bootstrap loader
└── deploy.ps1              # Zero-clone deployment script
```

---

## Contributing

- Issues & ideas: [GitHub Issues](https://github.com/pranems/SCIMServer/issues)
- Q&A / discussion: [Discussions](https://github.com/pranems/SCIMServer/discussions)
- ⭐ Star if this saved you time debugging provisioning!

---

## License

MIT — Built for the Microsoft Entra community.
