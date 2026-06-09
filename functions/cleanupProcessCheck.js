import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAvailabilityCheck(commands) {
    const results = {};
    for (const cmd of commands) {
        const process = Deno.run({
            cmd: [cmd],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await process.status();
        results[cmd] = (code === 0);
        process.close();
    }
    return results;
}

async function cleanupProcessCheck() {
    const requiredCommands = ['rm', 'taskkill'];
    const commandCheck = await commandAvailabilityCheck(requiredCommands);
    if (Object.values(commandCheck).includes(false)) {
        return Response.json({ error: 'One or more required commands are missing or invalid.' }, { status: 500 });
    }
    // Additional cleanup logic here.
    return Response.json({ message: 'All necessary commands are available for task execution.' });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        return await cleanupProcessCheck();
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});