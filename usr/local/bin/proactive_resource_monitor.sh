#!/bin/bash

# Proactive Resource Monitor

# Function to check CPU usage
check_cpu() {
    local cpu_usage=$(top -bn1 | grep 'Cpu(s)' | sed "s/.*, *//;s/%.*//")
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "High CPU usage detected: ${cpu_usage}%"
        # Here, you could implement an auto-remediation action
    fi
}

# Function to check disk space
check_disk() {
    local disk_usage=$(df / | grep / | awk '{ print $5 }' | sed 's/%//g')
    if [ "$disk_usage" -gt 90 ]; then
        echo "Disk space critical: ${disk_usage}%"
        # Here, auto-remediation could involve alerting or cleaning up
    fi
}

# Function to check service status
check_services() {
    local services=(
        "nginx"
        "mysql"
    )
    for service in "${services[@]}"; do
        if ! systemctl is-active --quiet $service; then
            echo "$service is down!"
            # Here, you could add a restart command or alert
        fi
    done
}

# Execute checks
check_cpu
check_disk
check_services
