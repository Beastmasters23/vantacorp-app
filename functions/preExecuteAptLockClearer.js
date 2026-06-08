import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    await exec('sudo apt-get clean'); // This attempts to clear the APT cache to avoid locks
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT locks before proceeding.
        await clearAptLocks();
        // Further processing goes here...
        return Response.json({ status: "APT locks cleared and ready for tasks." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});