import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    return new Promise((resolve, reject) => {
        Deno.run({
            cmd: ["sudo", "apt-get", "clean"],
            stdout: "null",
            stderr: "piped",
        }).status().then((status) => {
            if (status.success) {
                resolve();
            } else {
                reject(new Error('Failed to clear APT locks')); 
            }
        });
    });
}

async function checkCommandAvailability(commands) {
    for (const cmd of commands) {
        const status = await Deno.run({cmd: ['which', cmd], 
            stdout: "null",
            stderr: "piped"}).status();
        if (!status.success) {
            throw new Error('Missing command: ' + cmd);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        await checkCommandAvailability(['cat', 'echo', 'ls']); // Add essential commands here
        // Continue with your main task logic here
        return Response.json({ message: 'Environment check completed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});