#!/bin/bash

# Ambient System Health Monitor Script

# Function to check CPU usage
check_cpu() {
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
  echo "CPU Usage: $CPU_USAGE%"
  if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "High CPU usage detected. Taking action."
    # Trigger auto-remediation (e.g., restart a service or send an alert)
  fi
}

# Function to check Disk Space
check_disk() {
  DISK_USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
  echo "Disk Usage: $DISK_USAGE%"
  if [ $DISK_USAGE -gt 90 ]; then
    echo "Disk full. Taking action."
    # Trigger auto-remediation (e.g., cleanup old files or alert admin)
  fi
}

# Function to check running services
check_services() {
  # Change 'your_service_name' to the actual service you want to monitor
  if ! systemctl is-active --quiet your_service_name; then
    echo "Service is down. Attempting to restart."
    systemctl restart your_service_name
    # Check if the service is back up
    if systemctl is-active --quiet your_service_name; then
      echo "Service has been restarted successfully."
    else
      echo "Failed to restart the service. Alerting admin."
      # Send alert to admin
    fi
  fi
}

# Main function to execute checks
function main() {
  check_cpu
  check_disk
  check_services
}

# Run the main function periodically
while true; do
  main
  sleep 300 # run every 5 minutes
done
