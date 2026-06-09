import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const requiredCommands = ['cat', 'grep', 'awk'];

const checkCommandAvailability = async () => {
    const unavailableCommands = [];
    for (const cmd of requiredCommands) {
        const commandCheck = await Deno.run({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await commandCheck.status();
        if (!status.success) unavailableCommands.push(cmd);
    }
    return unavailableCommands;
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const unavailable = await checkCommandAvailability();
        if (unavailable.length > 0) {
            return Response.json({ error: 'Missing commands: ' + unavailable.join(', ') }, { status: 400 });
        }
        // Proceed with normal task execution
        // ... (task execution logic) ...
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});