import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLock() {
    // Logic to check and clear APT locks
    const ls = Deno.run({ cmd: ['bash', '-c', 'sudo fuser -vk /var/lib/dpkg/lock'] });
    await ls.status();
}

async function ensureCommandAvailability(command) {
    const cmdCheck = Deno.run({ cmd: ['which', command], stdout: 'null' });
    const status = await cmdCheck.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'echo']; // list of critical commands to ensure availability
    try {
        for (const command of commands) {
            if (!await ensureCommandAvailability(command)) {
                throw new Error(
                    `Required command ${command} is not available on the system.`
                );
            }
        }
        await checkAndClearLock(); // Clear any locked APT during task execution.
        // Your existing task execution code goes here

        return Response.json({ message: "Task executed successfully." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});