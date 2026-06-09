import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommands(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        try {
            await Deno.run({ cmd: [cmd, '--version'], stdout: 'null' }).status();
        } catch {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'awk'];  // Add critical commands needed for tasks
    const missingCommands = await checkCommands(requiredCommands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }
    // Proceed with normal task execution here
    return Response.json({ message: 'All required commands are available.' });
});