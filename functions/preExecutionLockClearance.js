import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTlock() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get clean');
        await exec('sudo rm /var/lib/dpkg/lock*');
        await exec('sudo rm /var/lib/apt/lists/lock');
        await exec('sudo rm /var/cache/apt/archives/lock');
        return true;
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isLockCleared = await clearAPTlock();
        return Response.json({ success: isLockCleared }, { status: isLockCleared ? 200 : 500 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});