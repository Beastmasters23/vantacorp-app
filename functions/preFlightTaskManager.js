import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks() {
    // Logic to clear stuck tasks functionality
}

async function checkCommandAvailability(commands) {
    for (const cmd of commands) {
        const available = await Deno.run({
            cmd: ['which', cmd],
        }).status();
        if (!available.success) {
            console.error(`Command not found: ${cmd}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'grep']; // Add more as necessary
    
    try {
        await clearStuckTasks();  // Clear tasks stuck in execution
        const commandsReady = await checkCommandAvailability(requiredCommands);
        if (!commandsReady) {
            return Response.json({ error: 'Required commands are not available for task execution.' }, { status: 400 });
        }
        // Normal execution flow
        return Response.json({ status: 'Tasks are ready for execution.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
