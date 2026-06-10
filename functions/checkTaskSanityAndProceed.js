import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkTaskSanity(taskParameters) {
    // Confirm valid task parameters are supplied 
    if (!taskParameters || typeof taskParameters !== 'object') {
        throw new Error('Invalid task parameters.');
    }
    // Further checks can include resource availability, task lock state, etc.
    const { taskID, timeout } = taskParameters;
    const taskStatus = await getTaskStatus(taskID); // hypothetical function to fetch task status
    if (taskStatus.running && taskStatus.duration >= timeout) {
        throw new Error('Task already running and exceeding timeout.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskParameters = await req.json(); // expecting incoming task parameters in body
    try {
        await checkTaskSanity(taskParameters);
        // Proceed with next operations if sanity checks pass
        // ... (your task logic here)
        return Response.json({ success: true });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});