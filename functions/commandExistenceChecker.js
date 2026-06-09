import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandExists(command: string): Promise<boolean> {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'null'
    });
    const { code } = await process.status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'grep'];  // Add all essential commands here
    const checks = await Promise.all(commandsToCheck.map(checkCommandExists));
    const missingCommands = commandsToCheck.filter((_, index) => !checks[index]);

    if (missingCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 500 });
    }

    // Continue with the normal operation of tasks
    try {
        // Your task execution code here
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});