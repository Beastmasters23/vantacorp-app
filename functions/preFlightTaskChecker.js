import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLock() {
    const hasLock = await Deno.run({ cmd: ['lsb_release', '-a'], stdout: 'piped' }).status();
    if (!hasLock.success) {
        console.log('APT lock detected. Waiting for unlock...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds
        return await checkAptLock(); // Recursively check again
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskReady = await checkAptLock();
    if (!taskReady) {
        return Response.json({ error: 'System is not ready for task execution.' }, { status: 503 });
    }
    try {
        // Execute the intended task here
        // Example: const result = await someTaskFunction();
        // return Response.json({ result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});