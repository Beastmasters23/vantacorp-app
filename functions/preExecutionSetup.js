import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTUsingShell() {
    const command = 'sudo fuser -k /var/lib/dpkg/lock';
    const process = Deno.run({
        cmd: ['bash', '-c', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    process.close();
    return new TextDecoder().decode(output) || new TextDecoder().decode(error);
}

async function checkCommand(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await process.output();
    const error = await process.stderrOutput();
    const success = process.status().code === 0;
    process.close();
    return { success, command, output: new TextDecoder().decode(output), error: new TextDecoder().decode(error) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'sed', 'awk'];
    try {
        // Clear any existing APT locks
        await clearAPTUsingShell();

        // Check availability of essential commands
        const checks = await Promise.all(commandsToCheck.map(checkCommand));
        const unavailableCommands = checks.filter(check => !check.success);
        if (unavailableCommands.length > 0) {
            throw new Error('Missing commands: ' + unavailableCommands.map(cmd => cmd.command).join(', '));
        }
        return Response.json({ message: 'All checks passed, ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});