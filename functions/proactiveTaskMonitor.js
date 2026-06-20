import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearStuckTasks();
        // Validate necessary system commands before executing tasks
        await validateCommands();
        return Response.json({ success: 'System checks passed, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearStuckTasks() {
    const maxRunningTime = 60 * 1000; // 60 seconds
    const currentTime = Date.now();
    const tasks = await getCurrentlyRunningTasks(); // Assuming this function retrieves running tasks

    for (const task of tasks) {
        if (currentTime - task.startTime > maxRunningTime) {
            await clearTask(task.id); // Assuming this function clears the stuck task
        }
    }
}

async function validateCommands() {
    const requiredCommands = ['CAT']; // List of essential commands
    for (const command of requiredCommands) {
        const exists = await commandExists(command); // Function to check command existence
        if (!exists) {
            throw new Error(`Critical command missing: ${command}`);
        }
    }
}

async function commandExists(command) {
    // Logic to check if a command is available in the system
    const result = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await result.status();
    return code === 0;
}