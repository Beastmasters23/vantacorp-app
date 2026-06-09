import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command: string): Promise<boolean> {
    const { status, stdout, stderr } = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    return status === 0 && stdout.length > 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'rm', 'echo']; // Add any required commands here
    const commandResults: Record<string, boolean> = {};
    
    for (const command of commandsToCheck) {
        commandResults[command] = await checkCommandAvailability(command);
    }

    const allCommandsAvailable = Object.values(commandResults).every(Boolean);
    if (!allCommandsAvailable) {
        return Response.json({
            error: 'One or more critical commands are missing.',
            commandResults
        }, { status: 500 });
    }

    // Proceed with further task logic if all commands are available.
    return Response.json({ success: true, commandResults }, { status: 200 });
});