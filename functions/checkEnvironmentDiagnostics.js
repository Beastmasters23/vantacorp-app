import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvironment() {
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', 'if lsof | grep -q apt; then echo locked; else echo unlocked; fi'],
        stdout: 'piped'
    });
    const aptLockStatus = new TextDecoder().decode(await aptLockCheck.output()).trim();

    const commandsToCheck = ['cat', 'ls', 'grep']; // List of essential commands
    let availableCommands = [];
    for (const cmd of commandsToCheck) {
        const cmdCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'piped'
        });
        const cmdOutput = new TextDecoder().decode(await cmdCheck.output()).trim();
        if (cmdOutput) availableCommands.push(cmd);
    }

    return {
        aptLockStatus,
        availableCommands,
    };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const diagnostics = await checkEnvironment();
        return Response.json(diagnostics);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});