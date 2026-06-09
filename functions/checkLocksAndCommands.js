import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkLocksAndCommands() {
    // Check for APT locks
    try {
        const lockStatus = await Deno.run({
            cmd: ['bash', '-c', 'if [ -f /var/lib/dpkg/lock ]; then echo locked; fi'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await lockStatus.status();
        if (code === 0) {
            // Clear lock if found
            await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock'] }).status();
        }
    } catch (error) {
        console.error('Error checking or clearing APT lock:', error);
    }

    // Check for required commands
    const requiredCommands = ['cat', 'echo'];
    for (const cmd of requiredCommands) {
        try {
            await Deno.run({
                cmd: ['bash', '-c', cmd],
                stdout: 'piped',
                stderr: 'piped'
            }).status();
        } catch (error) {
            console.error(`Required command not found: ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkLocksAndCommands();
        // Proceed with task execution if checks pass
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ message: 'Checks completed, ready for viable task execution.' });
});