import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLock() {
    const { stdout, stderr } = await Deno.run({
        cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock; then echo "locked"; else echo "unlocked"; fi'],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    return new TextDecoder().decode(stdout).trim() === 'unlocked';
}

async function checkCommands() {
    const requiredCommands = ['cat', 'echo', 'ls']; // expand this list as necessary
    const unavailableCommands = [];

    for (const command of requiredCommands) {
        const { code } = await Deno.run({ cmd: [command, '--help'], stderr: 'null' }).status();
        if (code !== 0) {
            unavailableCommands.push(command);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isAptUnlocked = await checkAptLock();
        const missingCommands = await checkCommands();

        if (!isAptUnlocked) {
            return Response.json({ error: 'APT is locked. Please resolve the APT lock before executing tasks.' }, { status: 503 });
        }
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 503 });
        }
        // Further node health checks can be added here, such as memory and CPU utilization.

        return Response.json({ message: 'All checks passed, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});