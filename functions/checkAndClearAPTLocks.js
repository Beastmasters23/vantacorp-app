import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from 'child_process';

async function checkAndClearAPTLocks() {
    return new Promise((resolve, reject) => {
        exec('sudo fuser -k /var/lib/dpkg/lock*', (err) => {
            if (err) return reject('Failed to clear APT locks.');
            resolve('APT locks cleared.');
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAPTLocks();  
        // Proceed with any subsequent task after confirming environment is clear
        return Response.json({ message: 'Environment is ready for task execution.' }, { status: 200 });
    } catch (error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});