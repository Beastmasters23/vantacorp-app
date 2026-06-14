import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        // Execute command to check for APT locks
        const lockCheck = Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/lib/dpkg/lock-frontend;'],
            stdout: 'piped',
            stderr: 'piped'
        });

        const [status] = await Promise.all([lockCheck.status(), lockCheck.output(), lockCheck.stderrOutput()]);

        if (status.success) {
            return { success: true, message: "APT locks cleared successfully." };
        } else {
            const errorMessage = new TextDecoder().decode(await lockCheck.stderrOutput());
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockClearResult = await clearAptLocks();
        return Response.json(lockClearResult);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});