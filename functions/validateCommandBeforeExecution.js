import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const { stdout, stderr } = await Deno.run({
        cmd: ['which', command],
        stdout: 'inherit',
        stderr: 'inherit',
    });
    const status = await stdout.status;
    return status.success;
}

async function verifyOutput(command) {
    try {
        const process = Deno.run({
            cmd: command,
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await process.output();
        if (output.length === 0) throw new Error('No output');
        return output;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo']; // Add crucial commands
    let unavailableCommands = [];

    for (const command of commandsToCheck) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) unavailableCommands.push(command);
    }

    if (unavailableCommands.length > 0) {
        return Response.json({ error: `Missing commands: ${unavailableCommands.join(', ')}` }, { status: 500 });
    }

    // Example command verification
    const result = await verifyOutput(['echo', 'Hello World']);
    if (result === null) {
        return Response.json({ error: 'Command execution failed or no output.' }, { status: 500 });
    }

    return Response.json({ success: true, output: new TextDecoder().decode(result) });
});