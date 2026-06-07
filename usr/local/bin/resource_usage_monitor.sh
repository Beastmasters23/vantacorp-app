#!/bin/bash

# A script to monitor and report CPU and memory usage
# Author: Vanta

THRESHOLD_CPU=80
THRESHOLD_MEM=80

# Function to check resource usage
check_resources() {
    CPU_USAGE=$(top -bn1 | grep 'Cpu(s)' | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')

    echo "CPU Usage: $CPU_USAGE%"
    echo "Memory Usage: $MEM_USAGE%"

    if (( $(echo "$CPU_USAGE > $THRESHOLD_CPU" | bc -l) )); then
        echo "Warning: CPU usage exceeded threshold of $THRESHOLD_CPU%"
    fi

    if (( $(echo "$MEM_USAGE > $THRESHOLD_MEM" | bc -l) )); then
        echo "Warning: Memory usage exceeded threshold of $THRESHOLD_MEM%"
    fi
}

# Main script execution
check_resources
