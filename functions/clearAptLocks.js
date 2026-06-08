import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get -y autoremove'); // Clear unnecessary packages.
        await exec('sudo apt-get clean'); // Clear local repository of retrieved package files.
        await exec('sudo fuser -k /var/lib/dpkg/lock'); // Forcefully clear locks if set.
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        throw new Error('Failed to clear APT locks.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});