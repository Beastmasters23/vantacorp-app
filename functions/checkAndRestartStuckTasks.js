import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const essentialCommands = ['CAT', 'ls', 'echo'];

async function checkForCmds(cmds) {
    const missing = cmds.filter(cmd => !Deno.run({cmd: [cmd]}).status().output);  
    return missing.length === 0;
}

async function restartStuckTasks() {
    // Pseudo code to retrieve and restart stuck tasks, assume fetchStuckTasks() fetches tasks stuck longer than threshold.
    const stuckTasks = await fetchStuckTasks();
    for (const task of stuckTasks) {
        await restartTask(task.id);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for essential commands
        const commandsAvailable = await checkForCmds(essentialCommands);
        if (!commandsAvailable) {
            return Response.json({ error: 'Essential commands are missing, aborting task execution.' }, { status: 400 });
        }

        // Restart stuck tasks before proceeding
        await restartStuckTasks();

        // Proceed with task execution
        // ... Your code here ...

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});