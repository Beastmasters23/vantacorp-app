import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'bash', 'python']; // list of essential commands

    async function checkCommandAvailability() {
        const unavailableCommands = [];
        for (const command of commands) {
            const result = await Deno.run({
                cmd: ["which", command],
                stdout: "piped",
                stderr: "piped"
            }).status();
            if (!result.success) {
                unavailableCommands.push(command);
            }
        }
        return unavailableCommands;
    }

    async function monitorStuckTasks() {
        const tasks = await fetch('/api/get-running-tasks'); // hypothetical path to fetch running tasks
        for (const task of tasks) {
            if (task.duration > 60) { // check for stuck tasks
                await fetch('/api/kill-task', {
                    method: 'POST',
                    body: JSON.stringify({ taskId: task.id })
                });
            }
        }
    }

    try {
        // Check if crucial commands are available
        const unavailableCommands = await checkCommandAvailability();
        if (unavailableCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${unavailableCommands.join(', ')}` }, { status: 500 });
        }
        // Monitor for stuck tasks
        await monitorStuckTasks();

        // Proceed with task execution logic here...

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});