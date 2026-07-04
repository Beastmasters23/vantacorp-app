#!/bin/bash

# Monitor critical system resources and take auto-remedial action

THRESHOLD_CPU=80
THRESHOLD_DISK=90

check_cpu() {
    CPU_USAGE=$(top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\)%* id.*/\1/' | awk '{print 100 - $1}')
    if (( $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc -l) )); then
        echo "High CPU usage detected: $CPU_USAGE%"
        # Take action (e.g., restart a service or log an alert)
        systemctl restart my_service
    fi
}

check_disk() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if (( DISK_USAGE > THRESHOLD_DISK )); then
        echo "Disk usage critical: $DISK_USAGE%"
        # Take action (e.g., log alert or clean temporary files)
        rm -rf /tmp/*
    fi
}

# Execute checks
check_cpu
check_disk
