import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Check if APT is locked
        const { success } = await exec("ps aux | grep apt | grep -v grep").status;
        if (success) {
            // If locked, attempt to remove the lock files
            await exec("sudo rm /var/lib/dpkg/lock-frontend");
            await exec("sudo rm /var/lib/dpkg/lock");
            await exec("sudo rm /var/cache/apt/archives/lock");
            await exec("sudo dpkg --configure -a");
            return { success: true, message: 'APT locks cleared.' };
        }
        return { success: false, message: 'No APT lock detected.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCheck = await clearAptLocks();
        if (!lockCheck.success) {
            return Response.json({ error: lockCheck.message }, { status: 500 });
        }
        // Proceed with other tasks here after lock is cleared
        return Response.json({ message: 'Ready to execute subsequent tasks.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});