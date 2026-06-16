import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndRetryTask(taskId) {
    const maxRetries = 3;
    let attempts = 0;
    let success = false;

    while (attempts < maxRetries && !success) {
        attempts++;
        const result = await simulateTaskExecution(taskId); // Simulate task execution

        if (result.success) {
            success = true;
            console.log(`Task ${taskId} executed successfully on attempt ${attempts}`);
        } else {
            console.log(`Task ${taskId} failed on attempt ${attempts}, retrying...`);
            await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000)); // Exponential backoff
        }
    }

    if (!success) {
        console.error(`Task ${taskId} failed after ${maxRetries} attempts.`);
    }
}

async function simulateTaskExecution(taskId) {
    // Simulating task success or failure
    return { success: Math.random() > 0.5 }; // Replace with actual task execution logic
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { taskId } = await req.json();
        await checkAndRetryTask(taskId);
        return Response.json({ status: 'Task check initiated.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});