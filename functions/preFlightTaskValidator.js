import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to check and clear APT locks
    async function clearAptLocks() {
        // Logic to clear apt locks, e.g., using shell commands
        let output;
        try {
            output = await fetch('/path/to/clear/apt/locks'); // Stub for clearing APT locks
        } catch (error) {
            console.error('Failed to clear APT locks:', error.message);
            return false;
        }
        return output.ok;
    }

    // Function to verify command availability
    async function checkCommandAvailability(command) {
        let output;
        try {
            output = await Deno.run({
                cmd: ['which', command],
                stdout: 'piped',
                stderr: 'piped'
            }).output();
        } catch (error) {
            console.error('Command not found:', command);
            return false;
        }
        return output.length > 0;
    }

    // Main task executor with pre-flight checks
    async function executeWithPreChecks(task) {
        const locksCleared = await clearAptLocks();
        const commandAvailable = await checkCommandAvailability(task.command);

        if (!locksCleared) {
            return Response.json({ error: 'Unable to clear APT locks' }, { status: 502 });
        }
        if (!commandAvailable) {
            return Response.json({ error: `Command not available: ${task.command}` }, { status: 404 });
        }

        // Proceed to execute the task (this is a placeholder)
        try {
            const taskOutput = await base44.runTask(task);
            return Response.json(taskOutput);
        } catch (executionError) {
            return Response.json({ error: executionError.message }, { status: 500 });
        }
    }

    // Replace with actual task derived from request
    const task = { command: 'ls' }; // Sample task
    return await executeWithPreChecks(task);
});