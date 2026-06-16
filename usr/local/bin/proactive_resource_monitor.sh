#!/bin/bash

# Proactive Resource Monitoring and Auto-Remediation Script

# Function to check CPU usage
check_cpu_usage() {
  CPU_USAGE=$(top -bn1 | grep 'Cpu(s)' | sed "s/.*, *\\(.*%\).*;/\1/"
  if (( $(echo "$CPU_USAGE > 80" |bc -l) )); then
    echo "High CPU usage detected: $CPU_USAGE%"
    # Auto-remediate: Kill the top CPU-consuming process
    TOP_PROCESS=$(ps -eo pid,comm,pcpu --sort=-pcpu | awk 'NR==2 {print $1}')
    echo "Killing process $TOP_PROCESS to free resources..."
    kill -9 $TOP_PROCESS
  fi
}

# Function to check disk usage
check_disk_usage() {
  DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
  if [ "$DISK_USAGE" -gt 90 ]; then
    echo "High disk usage detected: $DISK_USAGE%"
    # Auto-remediate: Cleanup old logs
    echo "Cleaning up old logs..."
    find /var/log -name '*.log' -type f -mtime +30 -exec rm -f {} \;
  fi
}

# Main monitoring function
monitor_resources() {
  echo "Monitoring system resources..."
  check_cpu_usage
  check_disk_usage
}

# Run the resource monitoring function
monitor_resources
