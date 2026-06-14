#!/bin/bash

# Proactive System Health Monitor for Linux Nodes

# Variables
CPU_THRESHOLD=80
DISK_THRESHOLD=90
SERVICE_NAME="your_service"

# Function to check CPU usage
check_cpu() {
  CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\) id.*/\\1/" | awk '{print 100 - $1}')
  if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "High CPU usage detected: $CPU_USAGE%"
  fi
}

# Function to check disk usage
check_disk() {
  DISK_USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
  if [ $DISK_USAGE -gt $DISK_THRESHOLD ]; then
    echo "Disk usage exceeded threshold: $DISK_USAGE%"
  fi
}

# Function to check service status
check_service() {
  if ! systemctl is-active --quiet $SERVICE_NAME; then
    echo "$SERVICE_NAME is not running! Starting the service."
    sudo systemctl start $SERVICE_NAME
  fi
}

# Main execution
check_cpu
check_disk
check_service
