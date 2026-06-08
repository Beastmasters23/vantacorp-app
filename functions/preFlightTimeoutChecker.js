import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskId = req.body.taskId;
        const timeoutLimit = 300; //Timeout limit in seconds
        const task = await base44.getTask(taskId);
        
        if (task.status === 'Running' && task.runtime > timeoutLimit) {
            await base44.terminateTask(taskId);
            return Response.json({ message: `Task ${taskId} terminated due to exceeding runtime limit.` }, { status: 200 });
        }

        return Response.json({ message: `Task ${taskId} is within safe runtime limits.` }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});