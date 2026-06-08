import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const [_, err] = await Promise.all([
        exec.status(),
        exec.output(),
        exec.stderrOutput()
    ]);
    if (!_.success) { 
        throw new Error(new TextDecoder().decode(err));
    }
}

async function executeTask(task) {
    await clearAptLocks();
    // Execute the actual task (assumed to be defined)
    const taskStatus = await runTask(task);
    return taskStatus;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const task = await req.json(); // Assuming the request contains the task
    try {
        const result = await executeTask(task);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});