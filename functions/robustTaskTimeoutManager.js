import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const COMMAND_TIMEOUT = 300; // timeout in seconds
    const TASK_TIMEOUT = 60; // max task running time

    const checkCommandAvailability = async (command) => {
        const process = Deno.run({
            cmd: ['which', command],
            stdout: 'piped'
        });
        const output = await process.output();
        const exitCode = await process.status();
        process.close();

        return exitCode.success;
    };

    const timeoutTask = async (taskFn, timeout) => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task timed out')), timeout * 1000);
        });
        return Promise.race([taskFn(), timeoutPromise]);
    };

    try {
        // Check if commands exist before executing tasks
        const commands = ['cat', 'echo', 'ls']; // list of essential commands
        const commandChecks = await Promise.all(commands.map(checkCommandAvailability));
        if (commandChecks.includes(false)) {
            return Response.json({ error: 'One or more essential commands are missing.' }, { status: 500 });
        }

        // Example task function
        const exampleTask = async () => {
            // Simulating task execution
            await new Promise(resolve => setTimeout(resolve, 65 * 1000)); // simulates a long-running task
            return 'Task completed.';
        };

        const result = await timeoutTask(exampleTask, TASK_TIMEOUT);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});