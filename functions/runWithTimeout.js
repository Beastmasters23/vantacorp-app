import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MAX_RETRIES = 3;
const TIMEOUT_SECONDS = 300;

async function runWithTimeout(task, retries) {
    const timeout = new Promise((_, reject) => setTimeout(() => {
        reject(new Error('Task timed out after ' + TIMEOUT_SECONDS + ' seconds'));
    }, TIMEOUT_SECONDS * 1000));

    try {
        return await Promise.race([task(), timeout]);
    } catch (error) {
        if (retries > 0) {
            console.warn(`Retrying task... Remaining attempts: ${retries}`);
            return runWithTimeout(task, retries - 1);
        }
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const task = async () => { /* place your task logic here */ };
        await runWithTimeout(task, MAX_RETRIES);
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});