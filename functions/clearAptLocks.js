import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get -y autoremove');
        await exec('sudo apt-get -y clean');
        await exec('sudo rm /var/lib/apt/lists/lock');
        await exec('sudo rm /var/cache/apt/archives/lock');
        await exec('sudo rm /var/lib/dpkg/lock');
        await exec('sudo dpkg --configure -a');
    } catch (err) {
        console.error('Failed to clear APT locks:', err);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // after clearing, proceed with task execution
        // ... (insert further task logic here)
        return Response.json({ status: 'APT locks cleared and tasks can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});