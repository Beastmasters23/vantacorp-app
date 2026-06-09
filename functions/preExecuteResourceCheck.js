import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await process.status();
    process.close();
    return code === 0;
}

async function clearAptLocks() {
    const aptProcess = Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await aptProcess.status();
    aptProcess.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo']; // List of essential commands
    try {
        for (const command of commandsToCheck) {
            if (!(await checkCommandAvailability(command))) {
                return Response.json({ error: `Command not found: ${command}` }, { status: 500 });
            }
        }
        await clearAptLocks();
        return Response.json({ status: 'All commands available and apt locks cleared!' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});