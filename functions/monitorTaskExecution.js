import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 60 * 1000; // 60 seconds for task execution

    const monitoredTask = async (taskFunction, ...args) => {
        const taskPromise = taskFunction(...args);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Task exceeded time limit')), TASK_TIMEOUT));
        return Promise.race([taskPromise, timeoutPromise]);
    };

    try {
        // Example of executing a long-running function. Replace with real task functions.
        const taskResult = await monitoredTask(yourTaskFunction);
        return Response.json({ result: taskResult });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});