import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo apt-get clean");
        await exec("sudo apt-get autoremove -y");
        await exec("sudo rm /var/lib/dpkg/lock-frontend");
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('Unable to clear APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();  // Pre-flight APT lock clearance
        // Here you would execute the intended directive
        return Response.json({ status: 'success', message: 'APT locks cleared and ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});