import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const results = {};
    for (const cmd of commands) {
        const commandCheck = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'piped',
        });
        const { code } = await commandCheck.status();
        results[cmd] = code === 0;
        commandCheck.close();
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'rm', 'ls'];  // List of critical commands to check
    try {
        const commandAvailability = await checkCommandAvailability(commands);
        return Response.json({ commandAvailability }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});