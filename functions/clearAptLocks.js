import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        exec('sudo apt-get clean && sudo rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock*', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error clearing APT locks: ${stderr}`);
                reject(stderr);
            }
            console.log(stdout);
            resolve('APT Locks cleared.');
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});