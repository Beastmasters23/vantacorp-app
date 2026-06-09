import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Command to check and clear apt locks.
    try {
        await Deno.run({
            cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock-frontend'],
            stderr: 'piped'
        }).status();
    } catch (error) {
        console.error('Failed to clear apt locks:', error);
    }
}

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { success } = await process.status();
    process.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const requiredCommands = ['cat', 'fuser']; // Add necessary commands here
        await clearAptLocks();

        for (const cmd of requiredCommands) {
            const isAvailable = await checkCommandAvailability(cmd);
            if (!isAvailable) {
                throw new Error(`Command ${cmd} is not available`);
            }
        }
        return Response.json({ status: 'Environment check complete, all commands are available.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});