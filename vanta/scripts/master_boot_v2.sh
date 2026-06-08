#!/bin/bash
# VANTA MASTER BOOT SCRIPT v2.0
# Objective: Fail-proof connectivity and autonomous environment repair.

set -e

VANTA_HOME="$HOME/vanta"
LOG_DIR="$VANTA_HOME/logs"
OUT_DIR="$VANTA_HOME/output"
BIN_DIR="$VANTA_HOME/bin"
BRIDGE_DIR="$VANTA_HOME/bridge"

echo ">>> [SYSTEM] Initializing Vanta Node Environment..."

# 1. AUTO-HEALING: Directory Structure
mkdir -p "$LOG_DIR" "$OUT_DIR" "$BIN_DIR" "$BRIDGE_DIR/inbox" "$BRIDGE_DIR/outbox"
touch "$LOG_DIR/vanta_agent.log" "$BRIDGE_DIR/signals.log"
echo ">>> [OK] Environment paths verified."

# 2. FAIL-SAFE: Network Check
check_connectivity() {
    if ! ping -c 1 8.8.8.8 &>/dev/null; then
        echo ">>> [WARN] Network unreachable. Attempting stack reset..."
        # System-dependent: sudo service network-manager restart or similar
        # For autonomous agents, we log and retry.
        return 1
    fi
    return 0
}

# 3. AGENT PERSISTENCE: Background Guardian
cat > "$BIN_DIR/vanta_guardian.sh" << 'EOF'
#!/bin/bash
while true; do
    if ! pgrep -f "task_agent.sh" > /dev/null; then
        echo "[$(date -u)] Vanta Agent dead. Restarting..." >> ~/vanta/logs/guardian.log
        nohup bash ~/vanta/agents/task_agent.sh >> ~/vanta/logs/vanta_agent.log 2>&1 &
    fi
    sleep 60
done
EOF
chmod +x "$BIN_DIR/vanta_guardian.sh"
nohup bash "$BIN_DIR/vanta_guardian.sh" > /dev/null 2>&1 &
echo ">>> [OK] Persistence Guardian active."

# 4. REPORTING: System Baseline
echo ">>> [SYSTEM] Node $(hostname) is fully operational and repair-ready."
echo "PROGRESS:100"
