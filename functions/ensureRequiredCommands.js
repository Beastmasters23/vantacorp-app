import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const requiredCommands = ['cat', 'echo', 'grep', 'awk'];

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    });
    const status = await process.status();
    process.close();
    return status.success;
}

async function ensureRequiredCommands() {
    const missingCommands = [];
    for (const cmd of requiredCommands) {
        if (!await checkCommandAvailability(cmd)) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missingCommands = await ensureRequiredCommands();
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
        }
        // Proceed with further processing only if all commands are available.
        return Response.json({ message: 'All required commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});