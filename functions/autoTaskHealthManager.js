import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for necessary commands
        const commands = ["cat", "echo", "ls"]; // Example critical commands
        const missingCommands = commands.filter(cmd => !Deno.run({cmd: [cmd]}).status().code);

        if (missingCommands.length > 0) {
            // Log missing commands
            await base44.logError(`Missing commands: ${missingCommands.join(', ')}`);
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
        }

        // Autonomously manage stuck tasks
        const TASK_TIMEOUT = 300; // seconds
        const task = Deno.run({ cmd: ["some_long_running_task"] });
        const status = await task.status();

        if (status.code !== 0) {
            if (status.code === 124) { // Exit code for timeout
                await base44.logWarning('Task timed out, terminating');
                task.close(); // Close task if it timed out
            }
            return Response.json({ error: 'Task failed to execute successfully' }, { status: 500 });
        }

        return Response.json({ message: 'Task executed successfully' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});