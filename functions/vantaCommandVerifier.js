import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCriticalCommands() {
    const commands = ['cat', 'grep', 'awk']; // add more critical commands as needed
    const unavailableCommands = [];

    for (const command of commands) {
        const cmdExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'null'
        }).status();
        if (cmdExists.code !== 0) {
            unavailableCommands.push(command);
        }
    }

    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const unavailable = await checkCriticalCommands();
        if (unavailable.length > 0) {
            return Response.json({error: 'Critical commands missing', missing: unavailable}, {status: 500});
        }
        // Proceed with task execution if all commands are available
        return Response.json({success: true}, {status: 200});
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});