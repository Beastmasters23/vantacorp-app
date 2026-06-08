import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function buildAgentPython(funcBase, hostname, hiveId) {
    return `import os, sys, time, json, subprocess, socket, platform as _platform

FUNC_BASE = "${funcBase}"
HOSTNAME  = os.environ.get("VANTA_HOSTNAME", "${hostname}" if "${hostname}" else socket.gethostname().lower())
VANTA_HOME = os.path.join(os.path.expanduser("~"), "vanta")
LOG_PATH   = os.path.join(VANTA_HOME, "vanta.log")
POLL_INTERVAL      = 5
HB_INTERVAL        = 30
HIVE_SYNC_INTERVAL = 300
BRAIN_SPAWN_DONE   = False

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
        with urllib.request.urlopen(req, timeout=15) as r:
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
            pass
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
    task_id = resp.get("task_id", "")
    if not task_id:
        return
    lang = resp.get("language", "bash")
    code = resp.get("code", "")
    if not code:
        return
    log(f"Running task {task_id} (lang={lang})")
    out_path = os.path.join(VANTA_HOME, "output", f"task_{task_id}.out")
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
    with open(out_path, "w") as f:
        f.write(output)
    api_post("vantaTaskPoll", {
        "hostname": HOSTNAME, "action": "complete",
        "task_id": task_id, "exit_code": exit_code, "output": output,
    })
    log(f"Task {task_id} done (exit={exit_code})")

HIVE_ID = "${hiveId}"

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

        const appUrl  = (Deno.env.get('VANTA_APP_URL') || '').replace(/\/$/, '');
        const funcBase = `${appUrl}/functions`;

        const adminName = employee_name || target_hostname;

        const agentPython = buildAgentPython(funcBase, target_hostname, hive_id);

        const agentB64 = btoa(unescape(encodeURIComponent(agentPython)));
        
        // Installer logic for different platforms...
        if (platform === 'windows') {
            // ... windows logic ...
        } else {
            // ... mac/linux logic ...
        }

        return Response.json({ status: 'ok', message: 'Installer logic would continue here' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});