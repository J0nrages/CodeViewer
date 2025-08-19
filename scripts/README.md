# CodeViewer Development Scripts

This directory contains utility scripts for CodeViewer development workflow.

## Scripts

### `kill-ports.sh`
Kills processes running on CodeViewer's specific ports (5200, 5201, 7900).

**Usage:**
```bash
bun run kill-ports
# or directly:
./scripts/kill-ports.sh
```

**What it does:**
- Finds processes using ports 5200, 5201, and 7900
- Attempts graceful termination (SIGTERM) first
- Force kills (SIGKILL) if processes don't respond
- Reports which processes were killed

### `pre-flight.sh`
Complete pre-flight check that prepares the development environment.

**Usage:**
```bash
bun run pre-flight
# or directly:
./scripts/pre-flight.sh
```

**What it does:**
1. **Port cleanup**: Runs `kill-ports.sh` to clear any stale processes
2. **Dependency update**: Installs/updates dependencies for both root and backend
3. **Verification**: Checks that critical files exist
4. **Ready confirmation**: Shows URLs for frontend and backend

## Updated Package.json Scripts

### Main Scripts (with pre-flight)
- `bun run dev` - Full development start with pre-flight check
- `bun run start` - Production start with pre-flight check

### Clean Scripts (without pre-flight)
- `bun run dev:clean` - Start development servers without pre-flight
- `bun run start:clean` - Start production servers without pre-flight

### Utility Scripts
- `bun run kill-ports` - Just kill port processes
- `bun run pre-flight` - Just run pre-flight checks

## Port Configuration

All port configurations are centralized in `config/ports.json`:

```json
{
  "frontend": {
    "dev": 5200,
    "preview": 5201
  },
  "backend": {
    "api": 7900
  }
}
```

## Workflow

**Recommended development start:**
```bash
bun run dev
```

This will:
1. Kill any processes on our ports
2. Update dependencies 
3. Verify setup
4. Start both frontend and backend servers

**Quick restart without checks:**
```bash
bun run dev:clean
```

Use this when you know the environment is already clean and you just want to restart servers quickly.