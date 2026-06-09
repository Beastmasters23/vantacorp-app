import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_THRESHOLD = 300; // seconds
    const retryAttempts = 3;

    async function executeTaskWithTimeout(directive) {
        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TASK_TIMEOUT_THRESHOLD * 1000);
            try {
                const result = await base44.runTaskWithDirective(directive, { signal: controller.signal });
                clearTimeout(timeoutId);
                return result;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log(`Task timed out after ${TASK_TIMEOUT_THRESHOLD} seconds on attempt ${attempt}.`);
                } else {
                    console.log(`Task failed: ${error.message}`);
                }
                if (attempt === retryAttempts) {
                    throw new Error(`Task failed after ${retryAttempts} attempts: ${error.message}`);
                }
            }
        }
    }

    try {
        const directive = JSON.parse(await req.text());
        const result = await executeTaskWithTimeout(directive);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});