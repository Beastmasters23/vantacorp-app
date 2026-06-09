import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function handleTask(task) {
    try {
        let retries = 0;
        let success = false;
        const maxRetries = 3;
        const timeout = 120; // seconds

        while (retries < maxRetries && !success) {
            const signal = Deno.signal(Deno.Signal.INT);
            const timeoutId = setTimeout(() => { throw new Error('Task timed out'); }, timeout * 1000);
            try {
                await executeTask(task); // function to execute the task
                success = true;
            } catch (err) {
                logError(err, task.id); // log the task error
            } finally {
                clearTimeout(timeoutId);
            }
            retries++;
        }

        if (!success) {
            throw new Error(`Task ${task.id} failed after ${maxRetries} attempts.`);
        }
    } catch (error) {
        logError(error, task.id);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const task = await base44.getTask();
        await handleTask(task);
        return Response.json({ message: 'Task completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});