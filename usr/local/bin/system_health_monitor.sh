#!/bin/bash

# Proactive System Health Monitor Script

# Function to check CPU usage
check_cpu() {
    cpu_usage=$(top -bn1 | grep 'Cpu(s)' | sed "s/.*, *\\([0-9.]*\)%* id.*/\\1/" | awk '{print 100 - $1}')
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "WARNING: High CPU usage detected — ${cpu_usage}%"
    fi
}

# Function to check disk space
check_disk() {
    disk_usage=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
    if [ $disk_usage -gt 90 ]; then
        echo "WARNING: Disk space critically low — ${disk_usage}% used"
    fi
}

# Function to check for failed services
check_services() {
    failed_services=$(systemctl --failed | grep -c 'failed')
    if [ $failed_services -gt 0 ]; then
        echo "WARNING: ${failed_services} services failed"
    fi
}

# Execute health checks
check_cpu
check_disk
check_services
