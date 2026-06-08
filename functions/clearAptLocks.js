import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLock = async () => {
    const { exec } = Deno;
    const command = 'sudo fuser -v /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock';
    const unlockCommand = 'sudo rm -f /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock';

    // Check for existing locks
    try {
        const { stderr } = await exec(command);
        if (stderr) {
            console.log('APT lock detected. Attempting to clear...');
            await exec(unlockCommand);
            console.log('APT locks cleared successfully.');
        } else {
            console.log('No APT locks found.');
        }
    } catch (error) {
        console.error('Error checking or removing APT locks:', error);
    }
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        return Response.json({ message: 'APT check completed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});