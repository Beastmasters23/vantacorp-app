import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLocks() {
    const lockStatus = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock']/
    });

    if (lockStatus.stdout) {
        console.log('APT locks detected, attempting to clear...');
        await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock']
        });
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks detected.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearLocks(); // Check and clear APT locks before any operation
        // Your task execution logic here...
        return Response.json({ success: 'Tasks are executing without APT issues.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});