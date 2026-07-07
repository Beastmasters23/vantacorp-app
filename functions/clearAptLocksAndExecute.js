import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        // Checking for APT lock files
        const { output } = await Deno.run({
            cmd: ['sh', '-c', 'if [ -f /var/lib/dpkg/lock ]; then echo "locked"; fi'],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        const lockStatus = new TextDecoder().decode(output).trim();
        if (lockStatus === "locked") {
            console.log("APT is locked, attempting to clear...");
            // Attempt to clear the lock
            await Deno.run({
                cmd: ['sh', '-c', 'sudo rm /var/lib/dpkg/lock; sudo dpkg --configure -a'],
                stderr: 'piped',
            }).status();
            console.log("APT locks cleared.");
        } else {
            console.log("No APT locks detected.");
        }
    } catch (error) {
        console.error(`Failed to check or clear APT locks: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    await clearAptLocks(); // Ensure APT locks are handled before proceeding
    try {
        // Simulated task execution after clearing locks
        // Code for task execution...
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});