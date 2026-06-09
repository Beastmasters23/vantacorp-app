import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvironment() {
    // Check for APT locks
    const aptLocked = await isAptLocked();
    if (aptLocked) {
        throw new Error('APT is currently locked. Please resolve this before executing tasks.');
    }

    // Verify essential commands availability
    const missingCommands = await verifyCommands(['cat', 'ls', 'echo']);
    if (missingCommands.length > 0) {
        throw new Error(`Missing commands detected: ${missingCommands.join(', ')}. Please install these commands.`);
    }

    return { status: 'Environment check passed' };
}

async function isAptLocked() {
    const result = await Deno.run({
        cmd: ['bash', '-c', "sudo fuser /var/lib/dpkg/lock"],
        stderr: 'piped',
        stdout: 'piped'
    });
    const { code } = await result.status();
    return code === 0;
}

async function verifyCommands(commands) {
    const missing = [];
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stderr: 'piped',
            stdout: 'piped'
        });
        const { code } = await result.status();
        if (code !== 0) missing.push(cmd);
    }
    return missing;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkEnvironment();
        return Response.json({ message: 'Environment checks passed' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});