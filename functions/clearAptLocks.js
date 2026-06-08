import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        // Check for existing apt locks
        const { stdout } = await exec("lsof /var/lib/dpkg/lock");
        if (stdout.length > 0) {
            console.log("Apt lock detected, attempting to clear...");
            // Attempt to remove locks
            await exec("sudo rm /var/lib/dpkg/lock");
            await exec("sudo rm /var/cache/apt/archives/lock");
            await exec("sudo rm /var/lib/dpkg/lock-frontend");
            console.log("Apt locks cleared.");
        } else {
            console.log("No apt locks found.");
        }
    } catch (error) {
        console.error("Error while clearing apt locks:", error);
        throw new Error("Failed to clear apt locks");
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: "Apt locks checked and cleared if necessary." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});