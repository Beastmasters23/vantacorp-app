import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorTaskOutput(task, maxRetries = 3, timeout = 300000) {
    let retries = 0;
    const startTime = Date.now();
    let output = '';

    while (retries < maxRetries) {
        const { code, stdout, stderr } = await Deno.run({
            cmd: task,
            stdout: 'piped',
            stderr: 'piped',
        }).output();

        output = new TextDecoder().decode(stdout);

        if (output.trim() || (Date.now() - startTime) > timeout) {
            break;
        }

        retries++;
        console.log(`Retrying task: ${task} - Attempt: ${retries}`);
    }

    if (!output.trim()) {
        console.error(`Task timed out or failed with no output after ${maxRetries} attempts.`);
        return null;
    }

    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const task = req.url.split('/').pop();  // Assuming task name comes from the URL
        const result = await monitorTaskOutput(task);
        return Response.json({ result }, { status: result ? 200 : 500 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});