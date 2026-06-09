import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks(): Promise<void> {
    // Code for clearing apt locks if found
    const response = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend']
    });
    await response.status();
}

async function checkCommandAvailability(command: string): Promise<boolean> {
    const commandCheck = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const {code} = await commandCheck.status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        const commands = ['cat', 'echo', 'bash', 'ls']; // Example commands
        for (const cmd of commands) {
            const isAvailable = await checkCommandAvailability(cmd);
            if (!isAvailable) {
                throw new Error(`Command not found: ${cmd}`);
            }
        }
        // Proceed with task execution if all checks pass
        return Response.json({ message: 'All system checks cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});