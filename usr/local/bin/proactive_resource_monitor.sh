#!/bin/bash

# Proactive Resource Monitor Script

# Check CPU Usage
cpu_usage=$(top -bn1 | grep 'Cpu(s)' | sed "s/.*, *\\([0-9.]*\)%* id.*/\\1/" | awk '{print 100 - $1}')
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    echo "High CPU usage detected: $cpu_usage%"
    # Add auto-remediation logic here
fi

# Check Disk Usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $disk_usage -gt 90 ]; then
    echo "Disk usage is critically high: $disk_usage%"
    # Add auto-remediation logic here
fi

# Check if any essential service is down
service_status=$(systemctl is-active my_essential_service)
if [ "$service_status" != "active" ]; then
    echo "Essential service is down! Attempting restart..."
    systemctl restart my_essential_service
fi
