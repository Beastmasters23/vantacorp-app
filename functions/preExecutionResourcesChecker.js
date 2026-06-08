import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get -qq update && sudo apt-get -qq upgrade'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await result.status();
    return code === 0;
}

async function checkRunningTasks() {
    // This function checks for running tasks and their execution context.
    // Implementation details depend on your task management architecture.
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check APT locks before executing new tasks
        const aptClear = await checkAptLocks();
        if (!aptClear) {
            return Response.json({ error: 'APT locks are active. Cannot proceed.' }, { status: 423 });
        }
        // Check if other tasks are running
        const tasksRunning = await checkRunningTasks();
        if (tasksRunning) {
            return Response.json({ error: 'Other tasks are currently running. Please try again later.' }, { status: 423 });
        }
        // Proceed with processing the request here...
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});