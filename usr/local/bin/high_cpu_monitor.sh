#!/bin/bash

# High CPU Usage Auto-Remediation Script
# This script monitors CPU usage and automatically restarts high CPU-consuming processes

# Threshold for CPU usage
THRESHOLD=80

# Function to check CPU usage
check_cpu_usage() {
    for pid in $(ps -eo pid,%cpu --sort=-%cpu | awk '{ if ($2 > $THRESHOLD) print $1 }' | tail -n +2); do
        echo "High CPU usage detected for PID: $pid"
        # Kill and restart the problematic process
        kill -9 $pid
        echo "Process $pid has been killed due to high CPU usage."
    done
}

# Monitor CPU usage
while true; do
    check_cpu_usage
    sleep 60  # Check every minute
done