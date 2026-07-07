import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        exec('sudo fuser -k /var/lib/dpkg/lock-frontend || true', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error clearing APT locks: ${stderr}`);
                return reject(error);
            }
            console.log(`APT locks cleared: ${stdout}`);
            resolve(stdout);
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Proceed with normal task execution here... 
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});