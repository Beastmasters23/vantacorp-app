import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec("sudo rm /var/lib/dpkg/lock* /var/lib/apt/lists/lock /var/cache/apt/archives/lock");
        console.log("APT locks cleared successfully.");
    } catch (e) {
        console.error("Failed to clear APT locks:", e);
        throw new Error('APT lock clearing failed');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Proceed with other critical operations after clearing locks
        return Response.json({ message: "APT locks checked and cleared." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});