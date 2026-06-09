import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForLocksAndCommands() {
    // Logic to check for APT locks
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock; then echo 1; else echo 0; fi'],
        stdout: 'piped'
    });
    const { code: lockCode } = await aptLockCheck.status();
    const lockOutput = await aptLockCheck.output();
    aptLockCheck.close();

    // Check for essential commands availability
    const commands = ['cat', 'echo', 'bash']; // Add more critical commands as needed
    const commandAvailability = await Promise.all(commands.map(async (cmd) => {
        const cmdCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped',
            stderr: 'null'
        });
        const { code } = await cmdCheck.status();
        cmdCheck.close();
        return code === 0;
    }));

    return {
        lockExists: lockOutput[0] === '1',
        commandsAvailable: commandAvailability.every(Boolean),
    };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { lockExists, commandsAvailable } = await checkForLocksAndCommands();

        if (lockExists) {
            return Response.json({ error: 'APT lock exists, please wait and try again.' }, { status: 503 });
        }

        if (!commandsAvailable) {
            return Response.json({ error: 'One or more essential commands are unavailable.' }, { status: 503 });
        }

        // Proceed with executing tasks

        return Response.json({ message: 'Environment validation successful, tasks can proceed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});