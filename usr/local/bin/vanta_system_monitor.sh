#!/bin/bash

# Proactive System Monitor Script
# This script monitors system resources and services and performs auto-remediation.

check_cpu_usage() {
    CPU_USAGE=$(top -bn1 | grep "%Cpu(s)" | sed "s/.*, \([0-9.]*\)%* id.*/\1/")
    let "CPU_USAGE=100-CPU_USAGE"
    if [ $CPU_USAGE -gt 80 ]; then
        echo "High CPU usage detected: $CPU_USAGE%"
        # Auto-remediation steps: Restart critical service
        systemctl restart your-critical-service
    fi
}

check_disk_space() {
    DISK_USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
    if [ $DISK_USAGE -gt 90 ]; then
        echo "Disk space critically low: $DISK_USAGE%"
        # Auto-remediation steps: Clean temporary files
        rm -rf /tmp/*
    fi
}

check_services() {
    SERVICE_STATUS=$(systemctl is-active your-critical-service)
    if [ "$SERVICE_STATUS" != "active" ]; then
        echo "Critical service is down, restarting..."
        systemctl start your-critical-service
    fi
}

# Main script execution
check_cpu_usage
check_disk_space
check_services

# Log the checks
echo "System monitored at $(date)" >> /var/log/vanta_monitor.log
