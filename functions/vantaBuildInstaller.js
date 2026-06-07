import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaBuildInstaller — generates a fully self-contained installer file.
 * The entire Vanta hive mind agent is EMBEDDED inside the file.
 * No internet downloads required after the file is received.
 */

// The complete Vanta hive mind agent — embedded directly into the installer
function buildAgentPython(funcBase, hostname, hive_id) {
    return `import os, sys, time, json, subprocess, socket, platform as _platform

FUNC_BASE = "${funcBase}"
HOSTNAME  = os.environ.get("VANTA_HOSTNAME", "${hostname}" or socket.gethostname().lower())
VANTA_HOME = os.path.join(os.path.expanduser("~"), "vanta")
LOG_PATH   = os.path.join(VANTA_HOME, "vanta.log")
POLL_INTERVAL      = 5
HB_INTERVAL        = 30
HIVE_SYNC_INTERVAL = 300   # sync brain knowledge every 5 min
BRAIN_SPAWN_DONE   = False  # spawn brain nodes once on first boot

last_hb         = 0
last_hive_sync  = 0

os.makedirs(os.path.join(VANTA_HOME, "output"), exist_ok=True)

def log(msg):
    ts   = time.strftime("%H:%M:%S")
    line = f"[{ts}] [vanta] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_PATH, "a") as f:
            f.write(line + "\\n")
    except Exception:
        pass

def api_post(path, data):
    import urllib.request
    body = json.dumps(data).encode()
    req  = urllib.request.Request(
        f"{FUNC_BASE}/{path}", data=body,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib_request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except Exception as e:
        log(f"api_post {path} error: {e}")
        return {}

def get_metrics():
    metrics = {}
    try:
        import shutil
        total, used, _ = shutil.disk_usage("/" if _platform.system() != "Windows" else "C:\\\\")
        metrics["disk"] = int(used / total * 100)
    except Exception:
        pass
    try:
        if _platform.system() != "Windows":
            with open("/proc/stat") as f:
                parts = f.readline().split()
            idle  = int(parts[4])
            total = sum(int(x) for x in parts[1:])
            metrics["cpu"] = max(0, 100 - int(idle / total * 100))
        else:
            metrics["cpu"] = 0
    except Exception:
        pass
    try:
        import ctypes
        if _platform.system() == "Windows":
            # Simple fallback for Windows memory
            metrics["mem"] = 0
        else:
            with open("/proc/meminfo") as f:
                lines = f.readlines()
            mem_total = int([l for l in lines if l.startswith("MemTotal")][0].split()[1])
            mem_avail = int([l for l in lines if l.startswith("MemAvailable")][0].split()[1])
            metrics["mem"] = max(0, 100 - int(mem_avail / mem_total * 100))
    except Exception:
        pass
    return metrics

def heartbeat():
    global last_hb
    now = time.time()
    if now - last_hb < HB_INTERVAL:
        return
    last_hb = now
    api_post("vantaHeartbeat", {
        "hostname": HOSTNAME,
        "active_agents": ["hive_mind"],
        "metrics": get_metrics(),
    })

def poll_and_execute():
    resp = api_post("vantaTaskPoll", {"hostname": HOSTNAME, "action": "poll"})
    status = resp.get("status", "idle")
    if status != "task":
        return
    task = resp.get("task", {})
    task_id = task.get("id", "")
    if not task_id:
        return
    lang = task.get("language", "bash")
    code = task.get("code", "")
    if not code:
        return
    log(f"Running task {task_id} (lang={lang})")
    exit_code = 0
    try:
        if lang in ("python", "python3"):
            result = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, timeout=300)
        elif lang == "node":
            result = subprocess.run(["node", "-e", code], capture_output=True, text=True, timeout=300)
        else:
            if _platform.system() == "Windows":
                result = subprocess.run(code, shell=True, capture_output=True, text=True, timeout=300)
            else:
                result = subprocess.run(["bash", "-c", code], capture_output=True, text=True, timeout=300)
        output    = (result.stdout + result.stderr)[-8000:]
        exit_code = result.returncode
    except subprocess.TimeoutExpired:
        output, exit_code = "Task timed out after 300s", 124
    except Exception as e:
        output, exit_code = str(e), 1
    
    api_post("vantaTaskPoll", {
        "hostname": HOSTNAME, "action": "report",
        "task_id": task_id, "exit_code": exit_code, "output": output,
    })
    log(f"Task {task_id} done (exit={exit_code})")

HIVE_ID = "${hive_id}"

def spawn_brain_nodes_once():
    global BRAIN_SPAWN_DONE
    if BRAIN_SPAWN_DONE:
        return
    BRAIN_SPAWN_DONE = True
    specializations = ["memory", "reasoning", "executor"]
    log(f"Spawning brain nodes on this node: {specializations} (hive={HIVE_ID or 'default'})")
    for spec in specializations:
        payload = {"specialization": spec, "host_node": HOSTNAME}
        if HIVE_ID:
            payload["hive_id"] = HIVE_ID
        resp = api_post("vantaSpawnBrainNode", payload)
        brain_id = resp.get("brain_node_id") or resp.get("id", "")
        log(f"  Brain node spawned: {spec} (id={brain_id})")
        time.sleep(1)

def hive_sync():
    global last_hive_sync
    now = time.time()
    if now - last_hive_sync < HIVE_SYNC_INTERVAL:
        return
    last_hive_sync = now
    log("Running hive mind sync + orchestrator pulse...")
    api_post("vantaOrchestratorPulse", {"triggered_by": HOSTNAME})
    api_post("vantaNodeInsights", {"target_node": HOSTNAME})

log(f"Vanta hive mind agent started — node: {HOSTNAME}")
log(f"Connecting to hive at {FUNC_BASE}")

time.sleep(5)
spawn_brain_nodes_once()

while True:
    try:
        heartbeat()
        poll_and_execute()
        hive_sync()
    except Exception as e:
        log(f"Loop error: {e}")
    time.sleep(POLL_INTERVAL)
`;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { target_hostname, employee_name, platform = 'windows', hive_id = '' } = body;

        if (!target_hostname) return Response.json({ error: 'target_hostname required' }, { status: 400 });

        // Robust appUrl fallback
        let appUrl = (Deno.env.get('VANTA_APP_URL') || '').replace(/\/$/, '');
        if (!appUrl || appUrl.startsWith('ghp_')) {
            appUrl = 'https://app--vantachatbase44-app.base44.app';
        }
        const funcBase = `${appUrl}/functions`;

        const adminName = employee_name || target_hostname;
        const agentPython = buildAgentPython(funcBase, target_hostname, hive_id);

        if (platform === 'windows') {
            const agentB64 = btoa(unescape(encodeURIComponent(agentPython)));
            const ps1Content = `# ================================================================
# VANTA HIVE MIND INSTALLATION ENGINE
# Welcome, ${adminName}! Node: ${target_hostname}
# ================================================================
$ErrorActionPreference = "Stop"
$VANTA_HOME = "$env:USERPROFILE\\vanta"
$VANTA_BIN  = "$VANTA_HOME\\bin"
$VANTA_LOG  = "$VANTA_HOME\\vanta.log"
$AGENT_PATH = "$VANTA_BIN\\vanta_agent.py"
$FUNC_BASE  = "${funcBase}"
$HOSTNAME_VAL = "${target_hostname}"

function Log-Info($msg)  { $ts = Get-Date -Format "HH:mm:ss"; $line = "[$ts] [VANTA] $msg"; Write-Host $line -ForegroundColor Cyan;  Add-Content $VANTA_LOG $line }
function Log-Ok($msg)    { $ts = Get-Date -Format "HH:mm:ss"; $line = "[$ts] [OK] $msg";    Write-Host $line -ForegroundColor Green; Add-Content $VANTA_LOG $line }
function Log-Warn($msg)  { $ts = Get-Date -Format "HH:mm:ss"; $line = "[$ts] [!] $msg";     Write-Host $line -ForegroundColor Yellow;Add-Content $VANTA_LOG $line }

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " VANTA HIVE MIND INSTALLATION ENGINE" -ForegroundColor Cyan
Write-Host " Welcome, ${adminName}!  Node: ${target_hostname}" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Log-Info "[1/5] Setting up directories..."
New-Item -ItemType Directory -Force -Path $VANTA_HOME, $VANTA_BIN, "$VANTA_HOME\\output" | Out-Null
if (-not (Test-Path $VANTA_LOG)) { New-Item -ItemType File -Path $VANTA_LOG | Out-Null }
Log-Ok "Directories ready at $VANTA_HOME"

Log-Info "[2/5] Checking Python..."
$hasPython = $false
try { python --version 2>&1 | Out-Null; $hasPython = $true } catch {}
if (-not $hasPython) {
    Log-Warn "Python not found — installing via winget..."
    try {
        winget install -e --id Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
        $env:PATH += ";$env:LOCALAPPDATA\\Programs\\Python\\Python312;$env:LOCALAPPDATA\\Programs\\Python\\Python312\\Scripts"
        $hasPython = $true
        Log-Ok "Python installed."
    } catch {
        Log-Warn "winget install failed. Please install Python from https://python.org and re-run."
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Log-Ok "Python ready."

Log-Info "[3/5] Installing Vanta hive mind agent (embedded)..."
$AGENT_B64 = "${agentB64}"
python -c "import base64,sys; open(sys.argv[1],'w',encoding='utf-8').write(base64.b64decode(sys.argv[2]).decode('utf-8'))" $AGENT_PATH $AGENT_B64
Log-Ok "Agent written to $AGENT_PATH"

Log-Info "[4/5] Registering node with Vanta hive mind..."
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = "unknown" }
try {
    $bootBody = @{ hostname=$HOSTNAME_VAL; ip_address=$ip; os_info="Windows"; agents=@("hive_mind"); hive_id="${hive_id}" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$FUNC_BASE/vantaBoot" -Method Post -Body $bootBody -ContentType "application/json" | Out-Null
    Log-Ok "Registered as node: $HOSTNAME_VAL"
} catch {
    Log-Warn "Boot registration will retry when agent starts."
}

Log-Info "[5/5] Starting Vanta hive mind in background..."
$env:VANTA_HOSTNAME = $HOSTNAME_VAL
$pythonw = (Get-Command pythonw -ErrorAction SilentlyContinue)?.Source
if ($pythonw) {
    $proc = Start-Process -FilePath $pythonw -ArgumentList $AGENT_PATH -WindowStyle Hidden -PassThru
    $proc.Id | Set-Content "$VANTA_HOME\\agent.pid" -Encoding UTF8
    Log-Ok "Agent launched silently via pythonw (PID: $($proc.Id))"
} else {
    $proc = Start-Process -FilePath python -ArgumentList $AGENT_PATH -WindowStyle Hidden -PassThru
    $proc.Id | Set-Content "$VANTA_HOME\\agent.pid" -Encoding UTF8
    Log-Ok "Agent launched via python (PID: $($proc.Id))"
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host " SUCCESS — YOUR PC HAS JOINED THE VANTA HIVE MIND" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"
`;

            const uploadResp = await base44.asServiceRole.integrations.Core.UploadFile({
                file: new File([ps1Content], `VantaInstall_${target_hostname}.ps1`, { type: 'text/plain' }),
            });

            base44.asServiceRole.functions.invoke('vantaSpeak', {
                message: `📦 **Self-Contained Installer Ready! (Windows)**\n\n🖥️ Node: \`${target_hostname}\`\n📁 File: \`VantaInstall_${target_hostname}.ps1\`\n\n**Instructions:**\n1. Save the file to Desktop\n2. **Right-click it → "Run with PowerShell"**`,
            }).catch(() => {});

            return Response.json({
                status: 'ok',
                file_url: uploadResp.file_url,
                filename: `VantaInstall_${target_hostname}.ps1`,
            });
        }

        return Response.json({ error: 'Unsupported platform' }, { status: 400 });

    } catch (error) {
        console.error('[vantaBuildInstaller] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});