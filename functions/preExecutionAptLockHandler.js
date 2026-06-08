import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks before proceeding with task execution.
        const aptLockCheck = await checkAndClearAptLocks();
        if (!aptLockCheck.success) {
            return Response.json({ error: "Failed to clear APT locks: " + aptLockCheck.message }, { status: 503 });
        }
        // Proceed with task execution logic here
        return Response.json({ message: "Ready to execute tasks." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/lib/dpkg/lock-frontend'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = new TextDecoder().decode(await result.output());
        const errorOutput = new TextDecoder().decode(await result.stderrOutput());
        if (result.status === 0) {
            return { success: true, message: output.trim() };
        } else {
            return { success: false, message: errorOutput.trim() };
        }
    } catch (error) {
        return { success: false, message: error.message }; 
    }
}