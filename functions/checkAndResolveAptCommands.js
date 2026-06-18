import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function checkAndResolveAptLocks() {
        const { status } = await Deno.run({ cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; sudo fuser -v /var/lib/apt/lists/lock;'] }).status();
        if (status === 0) {
            await Deno.run({ cmd: ['sudo', 'apt-get', 'update'] }).status();
            await Deno.run({ cmd: ['sudo', 'apt-get', 'upgrade'] }).status();
        }
    }

    async function ensureCommandsAvailable(codes) {
        for (const cmd of codes) {
            try {
                const { status } = await Deno.run({ cmd: ['bash', '-c', `command -v ${cmd}`] }).status();
                if (status !== 0) throw new Error(`Command ${cmd} not found.`);
            } catch (error) {
                console.error(error.message);
                return false;
            }
        }
        return true;
    }

    const requiredCommands = ['cat', 'echo']; // List critical commands here

    try {
        await checkAndResolveAptLocks();
        const commandsAvailable = await ensureCommandsAvailable(requiredCommands);
        if (!commandsAvailable) {
            return Response.json({ error: 'Essential commands are not available.' }, { status: 500 });
        }
        // Proceed with task execution using the available commands
        return Response.json({ status: 'Task ready for execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});