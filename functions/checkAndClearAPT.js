import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPT() {
    // Code to check APT lock status
    const lockStatus = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser /var/lib/dpkg/lock']
    });
    const output = await lockStatus.output();
    const isLocked = output.length > 0;
    if (isLocked) {
        // Logic to remove locks or alert about the issue
        await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock'] });
        console.log('APT lock cleared.');
    } else {
        console.log('No APT lock detected.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAPT();
        // Proceed with normal task execution...
        return Response.json({ message: 'APT check completed and tasks can proceed.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});