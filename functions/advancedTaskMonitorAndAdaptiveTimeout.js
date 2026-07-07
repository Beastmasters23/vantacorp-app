import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_THRESHOLD = 60 * 1000; // 60 seconds
    const DEFAULT_ADAPTIVE_TIMEOUT = 120 * 1000; // 120 seconds

    try {
        // Fetch historical task durations for adaptive timeout settings
        const historicalDurations = await base44.getHistoricalTaskDurations();
        const averageDuration = historicalDurations.reduce((a, b) => a + b, 0) / historicalDurations.length;
        const newTimeout = Math.max(averageDuration * 1.5, DEFAULT_ADAPTIVE_TIMEOUT);

        // Execute the new task with the adaptive timeout
        const response = await base44.executeTask({ timeout: newTimeout });

        if (!response.success) {
            // Log and handle failed task
            await base44.logTaskFailure(response.error);
            return Response.json({ error: response.error.message }, { status: 500 });
        }

        return Response.json({ result: response.data }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});