import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocksAndCommands() {
    const { exec } = Deno;
    try {
        const { code } = await exec('sudo fuser -v /var/lib/dpkg/lock');
        if (code === 0) {
            throw new Error('APT lock is active, please resolve it before continuing.');
        }
        const commands = ['cat', 'bash', 'ls'];  // List essential commands
        for (const cmd of commands) {
            const { code } = await exec(`which ${cmd}`);
            if (code !== 0) {
                throw new Error(`Critical command ${cmd} is missing.`);
            }
        }
        return { status: 'ready' }; 
    } catch (error) {
        return { error: error.message }; 
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const checkResult = await checkAptLocksAndCommands();
    if (checkResult.error) {
        return Response.json({ error: checkResult.error }, { status: 500 });
    }
    // Additional task logic goes here
    return Response.json({ status: 'Tasks can be executed safely.' }, { status: 200 });
});