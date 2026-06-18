#!/bin/bash

# Proactive Resource Monitor and Auto-Remediation Script

# Configuration
CPU_THRESHOLD=90  # CPU usage threshold percentage
DISK_THRESHOLD=90  # Disk usage threshold percentage

# Function to check CPU usage
check_cpu_usage() {
    local CPU_USAGE=$(top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\) id.*/\\1/' | awk '{print 100 - $1}')
    if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
        echo "High CPU usage detected: ${CPU_USAGE}%";
        # Possible remediation action could be added here
    fi
}

# Function to check disk usage
check_disk_usage() {
    local DISK_USAGE=$(df / | grep / | awk '{print $5}' | sed 's/%//g')
    if [ $DISK_USAGE -gt $DISK_THRESHOLD ]; then
        echo "High disk usage detected: ${DISK_USAGE}%";
        # Possible cleanup actions could be initiated here
    fi
}

# Main Execution
check_cpu_usage
check_disk_usage