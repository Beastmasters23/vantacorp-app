import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo rm /var/lib/apt/lists/lock");
        await exec("sudo rm /var/lib/dpkg/lock");
        await exec("sudo rm /var/cache/apt/archives/lock");
        await exec("sudo dpkg --configure -a");
    } catch (error) {
        throw new Error(`APT Lock clearance failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});