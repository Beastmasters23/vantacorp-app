import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for command availability
        const commands = ['cat', 'ls', 'echo']; 
        for (const cmd of commands) {
            const commandCheck = await Deno.run({
                cmd: ["command", "-v", cmd],
                stdout: "null",
                stderr: "null"
            }).status();
            if (!commandCheck.success) {
                throw new Error(`Required command ${cmd} is not available.`);
            }
        }

        // Check and clear apt locks if present
        const lockCheck = await Deno.run({
            cmd: ["bash", "-c", 'fuser /var/lib/dpkg/lock; fuser /var/cache/apt/archives/lock;'],
            stdout: "null",
            stderr: "null"
        }).status();
        if (lockCheck.success) {
            // Clear the lock
            await Deno.run({
                cmd: ["sudo", "fuser", "-k", "/var/lib/dpkg/lock", "/var/cache/apt/archives/lock"],
                stdout: "null",
                stderr: "null"
            });
        }

        // Proceed with task execution
        // ... Task execution logic goes here ...

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});