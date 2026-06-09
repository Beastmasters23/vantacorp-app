import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTAndCommands() {
    try {
        // Check for APT locks
        const lockCheck = await Deno.run({
            cmd: ['bash', '-c', "if [ -d '/var/lib/dpkg/lock-frontend' ] || [ -d '/var/lib/dpkg/lock' ]; then echo 'Locked'; else echo 'Unlocked'; fi"],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await lockCheck.status();
        lockCheck.close();
        if (code !== 0) throw new Error('Unable to check APT lock status.');

        // Check essential commands
        const requiredCommands = ['cat', 'echo', 'bash'];
        const commandCheckPromises = requiredCommands.map(async (cmd) => {
            const result = await Deno.run({
                cmd: ['bash', '-c', `command -v ${cmd}`],
                stdout: 'piped',
                stderr: 'piped'
            });
            const { code } = await result.status();
            result.close();
            return { cmd, available: code === 0 };
        });

        const commandResults = await Promise.all(commandCheckPromises);
        const unavailableCommands = commandResults.filter(result => !result.available);
        if (unavailableCommands.length > 0) {
            throw new Error('Missing commands: ' + unavailableCommands.map(c => c.cmd).join(', '));
        }

        return 'Pre-flight checks passed.';
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const preFlightCheckResult = await checkAPTAndCommands();
        return Response.json({ message: preFlightCheckResult }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});