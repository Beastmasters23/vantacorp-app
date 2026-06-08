import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function timeoutManager(taskFn, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Task timed out after ' + timeout + ' ms'));
        }, timeout);
        taskFn().then((result) => {
            clearTimeout(timer);
            resolve(result);
        }).catch((err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await timeoutManager(async () => {
            // Task logic here, e.g., checking for files, etc.
            // Simulating a task with setTimeout
            return new Promise(resolve => setTimeout(() => resolve('Task completed!'), 5000));
        }, 60000); // 60 seconds timeout
        return Response.json({ result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});