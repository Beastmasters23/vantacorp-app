import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "https://deno.land/x/exec/mod.ts";

async function clearAptLocks() {
    try {
        const { success } = await exec(`sudo rm /var/lib/apt/lists/lock`);
        const { success: success2 } = await exec(`sudo rm /var/cache/apt/archives/lock`);
        return success && success2;
    } catch (error) {
        console.error('Error clearing apt locks:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            return Response.json({ error: 'Failed to clear apt locks.' }, { status: 500 });
        }
        return Response.json({ message: 'Apt locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});