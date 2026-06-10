import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo rm -rf /var/lib/apt/lists/lock');
        await exec('sudo rm -rf /var/lib/dpkg/lock*');
    } catch (err) {
        console.error('Error clearing apt locks:', err);
        throw new Error('Apt locks could not be cleared.');
    }
}

async function checkCommands(commands) {
    for (const cmd of commands) {
        const cmdExists = await exec(`command -v ${cmd}`);
        if (cmdExists.code !== 0) {
            console.error(`Required command ${cmd} not found.`);
            throw new Error(`Missing command: ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo']; // Add any additional commands needed
    try {
        await checkAptLocks();
        await checkCommands(requiredCommands);
        return Response.json({ status: 'Checks passed, ready for execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});