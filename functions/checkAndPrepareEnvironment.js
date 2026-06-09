import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndPrepareEnvironment() {
    // Check for APT locks
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', 'dpkg-query -l | grep -e "^locks"'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await aptLockCheck.status();
    if (code === 0) {
        // APT locks found, attempt to clear them
        await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock'],
        }).status();
    }

    // Check for essential commands availability
    const requiredCommands = ['cat', 'echo', 'bash'];
    const missingCommands = [];

    for (const command of requiredCommands) {
        const cmdCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${command}`],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code } = await cmdCheck.status();
        if (code !== 0) {
            missingCommands.push(command);
        }
    }

    if (missingCommands.length > 0) {
        throw new Error(`Missing essential commands: ${missingCommands.join(', ')}`);
    }

    return true; // Success
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndPrepareEnvironment();
        // Proceed with the rest of the task execution.
        return Response.json({ message: 'Environment is ready for task execution.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});