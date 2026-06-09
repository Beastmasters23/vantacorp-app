import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const clearLocks = async () => {
        // Check and clear APT locks if found
        const locks = await Deno.run({
            cmd: ['bash', '-c', 'sudo apt-get -o DPkg::Lock::Timeout=60 -y autoremove']
        });

        return locks.status();
    };

    const checkCommandAvailability = async (command) => {
        const check = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await check.output();
        const errOutput = await check.stderrOutput();
        if (errOutput.length > 0) {
            return false; // Command not found
        }
        return true; // Command is available
    };

    try {
        // Example of handling lock clearance and command checks
        await clearLocks();

        const neededCommands = ['cat', 'bash'];
        for (const command of neededCommands) {
            const available = await checkCommandAvailability(command);
            if (!available) {
                return Response.json({ error: `${command} is not available` }, { status: 500 });
            }
        }

        // Proceed with the task logic (to be added accordingly)
        return Response.json({ message: 'Task can proceed' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});