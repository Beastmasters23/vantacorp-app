import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function executeWithTimeout(executeFunc, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Task timed out after ' + timeout + 'ms'));
        }, timeout);

        executeFunc().then(resolve).catch(reject).finally(() => {
            clearTimeout(timer);
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await executeWithTimeout(async () => {
            // Put the actual task logic here to be executed 
            // E.g. call a task from your function registry
            // return await vantaTaskPoll();
            throw new Error('Simulated Task Failure.'); // simulate a task for demonstration
        }, 300000); // 300 seconds timeout

        return Response.json({ result }, { status: 200 });
    } catch (error) {
        console.error('Error executing task:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});