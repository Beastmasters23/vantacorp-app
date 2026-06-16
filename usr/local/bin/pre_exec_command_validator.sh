#!/bin/bash

# Pre-Execution Command Validator

# Array of essential commands to check
COMMANDS=("netstat" "curl" "wget" "apt" "ls")

# Function to check command existence
check_commands() {
  for CMD in "${COMMANDS[@]}"; do
    if ! command -v $CMD &> /dev/null;
    then
      echo "Error: $CMD command is not available."
      return 1
    fi
  done
  echo "All essential commands are available."
  return 0
}

# Execute validation
check_commands
if [ $? -ne 0 ]; then
  echo "Validation failed. Aborting further execution."
  exit 1
fi

# Further commands can be placed here if validation passes
