import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorSystemdService(serviceName) {
    const process = Deno.run({
        cmd: ['systemctl', 'is-active', serviceName],
        stdout: 'piped',
        stderr: 'piped'
    });
    const [statusOutput, statusError] = await process.output();
    process.close();
    if (statusError.length > 0) throw new Error(new TextDecoder().decode(statusError));
    return new TextDecoder().decode(statusOutput).trim();
}

async function restartSystemdService(serviceName) {
    const process = Deno.run({
        cmd: ['systemctl', 'restart', serviceName],
        stdout: 'piped',
        stderr: 'piped'
    });
    const [restartOutput, restartError] = await process.output();
    process.close();
    if (restartError.length > 0) throw new Error(new TextDecoder().decode(restartError));
    return new TextDecoder().decode(restartOutput).trim();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasks = ["task1", "task2"]; // Example task identifiers

    for (let task of tasks) {
        try {
            const status = await monitorSystemdService(task);
            if (status !== 'active') {
                console.log(`Service ${task} is ${status}. Attempting to restart.`);
                await restartSystemdService(task);
                console.log(`Service ${task} successfully restarted.`);
            }
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }
    return Response.json({ message: 'Service monitoring complete.' });
});