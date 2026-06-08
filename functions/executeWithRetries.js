import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function executeWithRetries(taskFunc, retries = 3, backoffFactor = 2000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await taskFunc();
        } catch (error) {
            attempt++;
            if (attempt === retries) throw new Error(`All ${retries} attempts failed: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, backoffFactor * Math.pow(2, attempt)));
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskDirective = req.url.split('?')[1]; // Assuming task directive sent as query param

    try {
        const result = await executeWithRetries(async () => {
            // Dummy task execution based on directive, replace with actual task logic
            return await performTaskBasedOnDirective(taskDirective);
        });
        return Response.json({ success: true, result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function performTaskBasedOnDirective(directive) {
    // Implement the logic for the specific task execution based on the directive
    // This is a placeholder for task functionality
    return `Executed: ${directive}`;
}