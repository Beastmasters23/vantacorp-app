import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await base44.getTasks();  // Fetch currently active tasks

        for (const task of tasks) {
            const command = task.command;
            const result = await checkCommandAvailability(command);

            if (!result.available) {
                logError(`Command not available: ${command}`, task);
                continue;  // Skip this task
            }
            const output = await executeTask(command);
            if (!output.valid) {
                logError(`Invalid output for command: ${command}`, task);
            }
        }
        return Response.json({ status: 'Tasks checked' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkCommandAvailability(command) {
    // Simulating command availability check
    const availableCommands = ['ls', 'cat', 'echo']; // Example list
    return { available: availableCommands.includes(command) };
}

async function executeTask(command) {
    // Simulating task execution
    const output = (command === 'cat') ? 'Valid Output' : ''; // Simulates output
    return { valid: !!output };
}

function logError(message, task) {
    console.error(`Error in task ${task.id}: ${message}`);
}