#!/bin/bash

# Define log file location
LOG_FILE="/var/log/vanta_node_health.log"

# Thresholds for CPU and Disk usage
CPU_THRESHOLD=80
DISK_THRESHOLD=90

# Function to log messages
log_message() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Function to check CPU usage
check_cpu_usage() {
  CPU_USAGE=$(top -bn1 | grep "%Cpu(s)" | sed "s/.*, *\\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
  if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    log_message "High CPU usage detected: $CPU_USAGE%"
    # Trigger auto-remediation action if necessary
    # e.g., restart resource-intensive processes
  fi
}

# Function to check disk usage
check_disk_usage() {
  DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
  if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
    log_message "High disk usage detected: $DISK_USAGE%"
    # Trigger auto-remediation action if necessary
    # e.g., cleanup temporary files
  fi
}

# Main monitoring loop
while true; do
  check_cpu_usage
  check_disk_usage
  sleep 300  # Check every 5 minutes
done
