import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        exec('sudo fuser -k /var/lib/dpkg/lock-frontend', (error, stdout, stderr) => {
            if (error) {
                reject(`Error clearing apt lock: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Attempt to clear apt locks before proceeding
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared, system is ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});