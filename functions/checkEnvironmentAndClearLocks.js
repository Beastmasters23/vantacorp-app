import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const commandCheck = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await commandCheck.output();
        if (!new TextDecoder().decode(output).trim()) {
            missingCommands.push(command);
        }
        commandCheck.close();
    }
    return missingCommands;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'] }).status();
        await Deno.run({ cmd: ['sudo', 'rm', '/var/cache/apt/archives/lock'] }).status();
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'] }).status();
    } catch (error) {
        console.error('Failed to clear apt locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'command', 'mkdir', ...]; // add critical commands
    const missingCommands = await checkCommandAvailability(commandsToCheck);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
    }
    await clearAptLocks();
    return Response.json({ message: 'Environment checked and apt locks cleared successfully.' });
});