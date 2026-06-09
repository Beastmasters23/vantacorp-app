#!/bin/bash

# Proactive Resource Monitoring Script
# Monitors CPU and Disk Usage
# If usage exceeds thresholds, sends an alert and attempts to free resources

CPU_THRESHOLD=80
DISK_THRESHOLD=90
ALERT_EMAIL="admin@example.com"

# Function to check CPU usage
check_cpu() {
    CPU_USAGE=$(mpstat | awk 'NR==4 {print $3}')
    if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
        echo "High CPU usage detected: $CPU_USAGE%" | mail -s "CPU Alert" $ALERT_EMAIL
        # Attempt to free resources
        kill -9 $(ps aux --sort=-%cpu | awk 'NR>1 {print $2}' | head -n 5)
    fi
}

# Function to check Disk usage
check_disk() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if (( DISK_USAGE > DISK_THRESHOLD )); then
        echo "High Disk usage detected: $DISK_USAGE%" | mail -s "Disk Alert" $ALERT_EMAIL
        # Attempt to clean up
        find /tmp -type f -mtime +10 -exec rm {} \;
    fi
}

# Run checks
check_cpu
check_disk
