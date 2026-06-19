import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preFlightCommandChecker(requiredCommands) {
    const missingCommands = [];
    for (const command of requiredCommands) {
        const exists = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!exists.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'tar']; // List of critical commands
    const missingCommands = await preFlightCommandChecker(requiredCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
    }
    return Response.json({ message: 'All required commands are available.' });
});