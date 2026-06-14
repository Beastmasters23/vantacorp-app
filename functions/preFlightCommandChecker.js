import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailable(command: string): Promise<boolean> {
    const process = Deno.run({
        cmd: ['command', '-v', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await process.status();
    process.close();
    return status.success;
}

async function clearAptLocks(): Promise<void> {
    const process = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'null',
        stderr: 'null'
    });
     await process.status();
    process.close();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Step 1: Check for critical commands
        const commands = ['cat', 'echo']; // Add more critical commands as necessary
        for (const command of commands) {
            const isAvailable = await checkCommandAvailable(command);
            if (!isAvailable) {
                // If command is not available, optionally log or notify
                throw new Error(`Critical command ${command} is missing.`);
            }
        }

        // Step 2: Clear APT locks if any
        await clearAptLocks();
        return Response.json({ status: 'Pre-flight checks completed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});