#!/bin/bash

# File Availability Monitor Script

# Specify critical directories to monitor
DIRECTORIES=("/etc" "/var/log" "/home")

# Function to check file availability
check_files() {
    for dir in "${DIRECTORIES[@]}"; do
        echo "Checking directory: $dir";
        # List files and check if they exist
        for file in $(ls $dir); do
            if [ -e "$dir/$file" ]; then
                echo "File $dir/$file is available."
            else
                echo "WARNING: File $dir/$file is NOT available!"
            fi
        done
    done
}

# Run the file check function
check_files
