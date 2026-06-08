import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "https://deno.land/x/exec/mod.ts";

async function checkAndClearLocks() {
    try {
        const result = await exec("sudo fuser -k /var/lib/dpkg/lock* 2>&1");
        return result.stdout ? result.stdout : 'No locks found';
    } catch (error) {
        console.error('Error checking or clearing APT locks:', error);
        throw new Error('Failed to check or clear locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearLocks(); // Clear any APT locks before proceeding
        // Proceed with task execution here...
        return Response.json({ message: "Tasks can safely proceed." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});