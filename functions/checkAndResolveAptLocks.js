import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveAptLocks() {
    const { exec } = Deno;
    let isLocked = false;
    try {
        const { code } = await exec('sudo fuser /var/lib/dpkg/locks');
        isLocked = code === 0;
    } catch (error) {
        return { error: 'Error checking APT lock status: ' + error.message };
    }

    if (isLocked) {
        try {
            await exec('sudo kill -9 $(sudo fuser -v /var/lib/dpkg/locks | awk \'/^[ ]*[0-9]+/ {print $2}\')');
            await exec('sudo dpkg --configure -a');
        } catch (error) {
            return { error: 'Failed to clear APT lock: ' + error.message };
        }
    }
    return { success: 'APT locks cleared successfully if they were present.' };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockStatus = await checkAndResolveAptLocks();
        return Response.json(aptLockStatus, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});