import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 300; // Timeout duration in seconds

    const executeTaskWithTimeout = async (task) => {
        const process = Deno.run({
            cmd: task.command,
            stdout: "piped",
            stderr: "piped",
        });

        const { success } = await process.status();
        const output = await process.output();
        const error = await process.stderrOutput();
        process.close();

        if (!success) {
            throw new Error(new TextDecoder().decode(error));
        }
        return new TextDecoder().decode(output);
    };

    try {
        // Example task directive
        const task = { command: ['your-command', 'here'] }; // replace with actual command

        const taskExecution = executeTaskWithTimeout(task);
        const timeoutHandler = async () => {
            const timeout = setTimeout(() => {
                throw new Error(`Task timed out after ${TASK_TIMEOUT} seconds`);
            }, TASK_TIMEOUT * 1000);
            return taskExecution.finally(() => clearTimeout(timeout));
        };

        const result = await timeoutHandler();
        return Response.json({ result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});