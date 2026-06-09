import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const logs = [];
    try {
        const taskId = 'task_' + Date.now();
        logs.push({ taskId, status: 'started', timestamp: new Date().toISOString() });

        // Place your actual task logic here
        await performTask();

        logs.push({ taskId, status: 'completed', timestamp: new Date().toISOString() });
    } catch (error) {
        logs.push({ taskId, status: 'failed', error: error.message, timestamp: new Date().toISOString() });
        console.error(`Error in task ${taskId}: ${error.message}`);
    } finally {
        // Logging at the end for observability
        console.log('Task Execution Logs:', JSON.stringify(logs));
    }
});

async function performTask() {
    // Simulated task logic that may fail or succeed
    const randomOutcome = Math.random();
    if (randomOutcome < 0.5) {
        throw new Error('Simulated task failure');
    }
}