#!/bin/bash

# Proactive Resource Usage Monitor with Auto-Remediation

THRESHOLD_CPU=80
THRESHOLD_MEM=80

# Function to check CPU usage
check_cpu() {
  CPU_USAGE=$(top -bn1 | grep 'Cpu(s)' | sed "s/.*, *\\([0-9.]*\)%* id.*/\\1/" | awk '{print 100 - $1}')
  if (( $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc -l) )); then
    echo "High CPU usage detected: $CPU_USAGE%"
    # Your remediation action here
    echo "Restarting resource-intensive processes..."
  fi
}

# Function to check Memory usage
check_mem() {
  MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
  if (( $(echo "$MEM_USAGE > $THRESHOLD_MEM" | bc -l) )); then
    echo "High memory usage detected: $MEM_USAGE%"
    # Your remediation action here
    echo "Clearing cache..."
    sudo sync; sudo echo 3 > /proc/sys/vm/drop_caches
  fi
}

# Main monitoring loop
while true; do
  check_cpu
  check_mem
  sleep 60 # Check every minute
done
