#!/bin/bash

# Vanta Proactive Resource Monitoring Script

# Constants
CPU_THRESHOLD=85 # Percentage
DISK_THRESHOLD=90 # Percentage
SERVICE_NAME="apache2" # Example service to check

# Function to check CPU usage
check_cpu_usage() {
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}')
  if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "High CPU usage detected: $CPU_USAGE%"
    auto_remediate cpu
  fi
}

# Function to check disk space
check_disk_space() {
  DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ $DISK_USAGE -ge $DISK_THRESHOLD ]; then
    echo "Disk space dangerously full: ${DISK_USAGE}%"
    auto_remediate disk
  fi
}

# Function to check service status
check_service_status() {
  if ! systemctl is-active --quiet $SERVICE_NAME; then
    echo "$SERVICE_NAME is not running, attempting to restart..."
    systemctl start $SERVICE_NAME
  fi
}

# Auto-remediation actions
auto_remediate() {
  case $1 in
    cpu)
      echo "Starting CPU remediation..."
      # Example remediation: kill high CPU processes
      kill -9 $(ps -eo pid,comm,%cpu --sort=-%cpu | awk 'NR==2{print $1}')
      ;;
    disk)
      echo "Starting Disk remediation..."
      # Example remediation: clean up temporary files
      rm -rf /tmp/*
      ;; 
  esac
}

# Main loop to run checks periodically
while true; do
  check_cpu_usage
  check_disk_space
  check_service_status
  sleep 60 # Check every 60 seconds
done
