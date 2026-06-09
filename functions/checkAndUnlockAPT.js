import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkAndUnlockAPT = async () => {
        const aptLocked = await checkForAptLock();
        if (aptLocked) {
            await resolveAptLock();
        }
    };

    const checkForAptLock = async () => {
        try {
            const result = await Deno.run({
                cmd: ['bash', '-c', 'sudo fuser /var/lib/dpkg/lock'],
                stdout: "piped",
                stderr: "piped",
            });
            const output = await result.output();
            return output.length > 0; // APT lock is active
        } catch (error) {
            console.error('Error checking APT lock:', error);
            return false;
        }
    };

    const resolveAptLock = async () => {
        try {
            await Deno.run({
                cmd: ['bash', '-c', 'sudo killall -9 dpkg'],
                stdout: "piped",
                stderr: "piped",
            });
            console.log('APT lock resolved.');
        } catch (error) {
            console.error('Failed to resolve APT lock:', error);
        }
    };

    try {
        await checkAndUnlockAPT();
        // Proceed with subsequent task execution.
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});