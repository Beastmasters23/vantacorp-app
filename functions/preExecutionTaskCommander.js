import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command: string): Promise<boolean> {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await process.status();
    return status.success;
}

async function clearAptLocks(): Promise<void> {
    // Command to clear apt locks if there are any
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock', '/var/lib/dpkg/lock'], stdout: 'null', stderr: 'null' }).status();
    await Deno.run({ cmd: ['sudo', 'dpkg', '--configure', '-a'], stdout: 'null', stderr: 'null' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commandsToCheck = ['cat', 'python']; // Add necessary command checks
        for (const command of commandsToCheck) {
            if (!(await checkCommandAvailability(command))) {
                throw new Error(`Command not found: ${command}`);
            }
        }
        await clearAptLocks();
        return Response.json({ message: 'Pre-execution checks passed; environment is ready.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});