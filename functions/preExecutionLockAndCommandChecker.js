import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndCheckCommands() {
    // Attempt to clear APT locks
    const result = await runShellCommand('sudo apt-get clean');
    if (result.exitCode !== 0) throw new Error('Failed to clear APT locks');

    // Check for essential commands
    const commands = ['cat', 'mkdir', 'rm']; // Add more as needed
    for (const command of commands) {
        const cmdCheck = await runShellCommand(`command -v ${command}`);
        if (cmdCheck.exitCode !== 0) throw new Error(`Command not found: ${command}`);
    }
}

async function runShellCommand(command) {
    const { status } = await Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped'
    }).status();
    const output = await Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    return { exitCode: status.code, stdout: new TextDecoder().decode(output) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLocksAndCheckCommands();
        // Continue with task execution...
        return Response.json({ message: 'Pre-execution check passed.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});