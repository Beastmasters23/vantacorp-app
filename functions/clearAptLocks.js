import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Check for APT locks
        const checkLock = await exec("lsof /var/lib/dpkg/lock /var/cache/apt/archives/lock");
        if (checkLock.status.success) {
            console.log('APT locks detected. Attempting to clear...');
            // Clear APT locks
            await exec("sudo rm /var/lib/dpkg/lock");
            await exec("sudo rm /var/cache/apt/archives/lock");
            console.log('APT locks cleared.');
        } else {
            console.log('No APT locks detected.');
        }
    } catch (error) {
        console.error('Error clearing APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Ensure locks are clear before executing tasks
        // Proceed with the main logic of your Deno service...  
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});