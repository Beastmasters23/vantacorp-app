import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkTaskHealth(taskId) {
    const taskStatus = await getTaskStatus(taskId);
    return taskStatus.output !== null;
}

async function executeTask(taskId, dependencies) {
    for (const dependency of dependencies) {
        const isHealthy = await checkTaskHealth(dependency);
        if (!isHealthy) {
            await retryTask(dependency);
        }
    }
    const result = await runActualTask(taskId);
    return result;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.headers.get('Task-ID');
    const dependencies = await getTaskDependencies(taskId);
    try {
        const result = await executeTask(taskId, dependencies);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});