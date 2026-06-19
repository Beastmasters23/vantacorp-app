import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
const MAX_RETRIES = 3;

async function checkDependencies() {
    const aptLock = await Deno.run({ cmd: ['bash', '-c', 'if fuser /var/lib/dpkg/lock &>/dev/null; then echo "LOCKED"; exit 1; fi'] });
    const commandCheck = await Deno.run({ cmd: ['bash', '-c', 'command -v cat'] });

    if (await aptLock.status() && await commandCheck.status()) {
        return true;
    }
    return false;
}

async function executeTask(task) {
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
        if (await checkDependencies()) {
            // Execute the task
            console.log(`Running task: ${task}`);
            return;
        } else {
            console.log(`Dependencies not met for task: ${task}, retrying...`);
            attempts++;
        }
    }
    throw new Error(`Task failed after ${MAX_RETRIES} attempts.`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const task = req.url.split('/').pop(); // Get task directive from URL
    try {
        await executeTask(task);
        return Response.json({ status: 'Task executed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});