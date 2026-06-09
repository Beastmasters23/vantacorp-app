import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPT('${pathToLockFiles}') {
    const { exec } = Deno;
    try {
        // Identify and remove APT lock files
        await exec(`sudo rm -f ${pathToLockFiles}/apt.lock`);
        await exec(`sudo rm -f /var/lib/dpkg/lock*`);
        await exec(`sudo rm -f /var/cache/apt/archives/lock`);
        return { status: 'success', message: 'APT lock files cleared successfully!' };
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('Unable to clear APT locks.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const pathToLockFiles = '/var/lib/dpkg'; // You can modify this path accordingly 
    try {
        const clearResult = await clearAPT(pathToLockFiles);
        return Response.json({ success: clearResult.message }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});