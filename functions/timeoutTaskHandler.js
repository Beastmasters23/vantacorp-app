import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function timeoutPromise(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), timeoutMs))
    ]);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Simulated task that may hang
        const result = await timeoutPromise(someLongRunningTask(), 30000); // timeout after 30 seconds
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});