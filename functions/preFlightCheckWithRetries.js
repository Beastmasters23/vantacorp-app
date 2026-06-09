import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandsAndLocks() {
    const requiredCommands = ['ls', 'cat', 'echo']; // List of essential commands
    for (const cmd of requiredCommands) {
        const commandExists = await Deno.run({
            cmd: [`which`, cmd],
            stdout: "piped",
        }).status();
        if (!commandExists.success) {
            throw new Error(`Required command '${cmd}' is not available.`);
        }
    }
    const hasLock = await Deno.run({
        cmd: [`lsof`, `|`, `grep`, `/var/lib/dpkg/lock`],
        stdout: "piped",
    }).status();
    if (hasLock.success) {
        throw new Error(`APT lock detected, unable to proceed.`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkCommandsAndLocks(); // Check for commands and locks
        // Further task processing logic here
        return Response.json({ message: "Task processed successfully." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});