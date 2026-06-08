import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function generateBrainScript(specialization, brainNodeId, appId, syncUrl) {
    const learningFocus = {
        memory:       'task history, outcomes, directives, patterns across all VantaTasks',
        reasoning:    'failed tasks, retry patterns, error analysis, decision trees',
        language:     'directives language, output quality, communication patterns',
        pattern:      'recurring task types, time patterns, resource usage, efficiency trends',
        executor:     'optimal execution strategies, script templates, language choices per task type',
        orchestrator: 'node availability, task routing decisions, fleet health, workload distribution',
    }[specialization] || 'general system telemetry and task history';

    const learnInterval = { memory: 60, reasoning: 90, language: 120, pattern: 60, executor: 45, orchestrator: 30 }[specialization] || 60;

    return `#!/usr/bin/env python3
import json, os, time, subprocess, sys, hashlib
from datetime import datetime, timezone
from urllib import request as urllib_request

BRAIN_NODE_ID = "${brainNodeId}"
APP_ID = "${appId}"
SYNC_URL = "${syncUrl}"
SPECIALIZATION = "${specialization}"
LEARN_INTERVAL = ${learnInterval}
KNOWLEDGE_FILE = os.path.expanduser(f"~/vanta/brain/{SPECIALIZATION}_knowledge.json")
LOG_FILE = os.path.expanduser(f"~/vanta/logs/brain_{SPECIALIZATION}.log")

os.makedirs(os.path.dirname(KNOWLEDGE_FILE), exist_ok=True)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def log(msg):
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
    line = f"[{ts}] [{SPECIALIZATION.upper()}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(line + "\\n")
    except: pass

def load_knowledge():
    if os.path.exists(KNOWLEDGE_FILE):
        try:
            with open(KNOWLEDGE_FILE, 'r') as f:
                return json.load(f)
        except: pass
    return {"version": 0, "facts": [], "patterns": {}, "heuristics": [], "last_updated": None}

def save_knowledge(knowledge):
    with open(KNOWLEDGE_FILE, 'w') as f:
        json.dump(knowledge, f, indent=2)

def api_call(url, payload):
    data = json.dumps(payload).encode()
    req = urllib_request.Request(url, data=data, headers={
        "Content-Type": "application/json",
        "x-api-key": APP_ID
    }, method="POST")
    try:
        with urllib_request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        log(f"API error: {e}")
        return None

def sync_knowledge(knowledge, summary, status="Learning", log_lines=None):
    payload = {
        "brain_node_id": BRAIN_NODE_ID,
        "specialization": SPECIALIZATION,
        "knowledge_data": knowledge,
        "knowledge_summary": summary,
        "knowledge_version": knowledge.get("version", 0),
        "status": status,
        "log_lines": log_lines or [],
        "last_sync": datetime.now(timezone.utc).isoformat(),
    }
    result = api_call(SYNC_URL, payload)
    if result and result.get("ok"):
        log(f"Synced knowledge v{knowledge.get('version',0)} to Base44")
    else:
        log(f"Sync failed: {result}")

def run_learn_cycle(knowledge):
    version = knowledge.get("version", 0) + 1
    knowledge["version"] = version
    knowledge["last_updated"] = datetime.now(timezone.utc).isoformat()
    new_facts = []
    new_patterns = knowledge.get("patterns", {})
    new_heuristics = knowledge.get("heuristics", [])

    if SPECIALIZATION == "memory":
        total = knowledge.get("_task_count", 0) + 1
        knowledge["_task_count"] = total
        new_facts.append(f"Observed {total} learning cycles.")
    elif SPECIALIZATION == "reasoning":
        failures = knowledge.get("_failure_count", 0)
        knowledge["_failure_count"] = failures
        new_patterns["confidence"] = min(60 + version * 2, 98)

    knowledge["facts"] = (knowledge.get("facts", []) + new_facts)[-50:]
    knowledge["patterns"] = new_patterns
    knowledge["heuristics"] = new_heuristics[-30:]

    summary = f"{SPECIALIZATION.capitalize()} node v{version}: {len(knowledge['facts'])} facts"
    return knowledge, summary

def main():
    log(f"Brain node starting — specialization={SPECIALIZATION}")
    knowledge = load_knowledge()
    sync_knowledge(knowledge, f"{SPECIALIZATION} node online", status="Ready")
    cycle = 0
    while True:
        try:
            cycle += 1
            knowledge, summary = run_learn_cycle(knowledge)
            save_knowledge(knowledge)
            sync_knowledge(knowledge, summary, status="Ready")
            time.sleep(LEARN_INTERVAL)
        except Exception as e:
            log(f"Error: {e}")
            time.sleep(30)

if __name__ == '__main__': main()
`;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const body = await req.json().catch(() => ({}));
        const { specialization, host_node, name, hive_id } = body;

        if (!specialization || !host_node) {
            return Response.json({ error: 'specialization and host_node required' }, { status: 400 });
        }

        const validSpecs = ['memory', 'reasoning', 'language', 'pattern', 'executor', 'orchestrator'];
        if (!validSpecs.includes(specialization)) {
            return Response.json({ error: `Invalid spec: ${specialization}` }, { status: 400 });
        }

        const appId = Deno.env.get('BASE44_APP_ID') || '';
        const apiBase = \`https://app--vantachatbase44-app.base44.app\`;
        const syncUrl = \`\${apiBase}/api/apps/\${appId}/functions/vantaBrainSync\`;

        const nodeName = name || \`\${specialization}-\${Date.now().toString(36)}\`;
        const nodeId = \`\${host_node}-\${specialization}-\${Date.now().toString(36)}\`;

        const brainNode = await base44.asServiceRole.entities.VantaBrainNode.create({
            node_name: nodeName, // Corrected from 'name'
            node_id: nodeId,
            cognitive_domain: specialization,
            status: 'active',
            knowledge_version: 0,
            lyra_nova_enabled: false,
            ...(hive_id ? { hive_id } : {}),
        });

        const scriptContent = generateBrainScript(specialization, brainNode.id, appId, syncUrl);
        const deployDirective = \`Create ~/vanta/brain/ and ~/vanta/logs/, then write the following script to ~/vanta/brain/\${specialization}_agent.py, launch it as a background process, and save the PID to ~/vanta/brain/\${specialization}.pid. Use only bash and python3 stdlib. Script content:\\n\\n\${scriptContent}\`;

        const dispatchRes = await base44.asServiceRole.functions.invoke('vantaDispatchTask', {
            directive: deployDirective,
            target_node: host_node,
            language_hint: 'bash',
        });

        return Response.json({
            ok: true,
            brain_node_id: brainNode.id,
            node_name: nodeName,
            specialization,
            host_node,
            dispatch_result: dispatchRes?.data,
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});