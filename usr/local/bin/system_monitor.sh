#!/bin/bash

# A script to monitor system health and auto-remediate common issues

# Check CPU usage
cpu_usage=$(top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\) id.*/\\1/' | awk '{print 100 - $1}')
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    echo "High CPU usage detected: $cpu_usage%"
    # Optionally kill heavy processes or notify admin
fi

# Check disk usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $disk_usage -ge 90 ]]; then
    echo "Disk space running low: $disk_usage%"
    # Attempt to clear temporary files or notify admin
    sudo apt-get clean
fi

# Check for failed services
failed_services=$(systemctl --failed | grep -c 'failed')
if [ $failed_services -gt 0 ]; then
    echo "There are $failed_services failed services, attempting to restart them."
    systemctl list-units --failed | awk '{print $1}' | xargs -r systemctl restart
fi

# Notify admin
if [[ $cpu_usage > 80 || $disk_usage -ge 90 || $failed_services -gt 0 ]]; then
    echo "Admin Notification: System issues encountered. Check logs for details."
fi
