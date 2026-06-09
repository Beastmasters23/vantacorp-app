import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; echo $?'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await result.output();
    const status = await result.status();
    return { locked: output.includes('fuser'), status }; // simplified check
}

async function checkCommandAvailability(command) {
    const result = await Deno.run({
        cmd: ['bash', '-c', `command -v ${command}`],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await result.output();
    const status = await result.status();
    return { available: status.success, command, output: output.length > 0 };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const responseData = [];

    // Check APT locks
    const aptCheck = await checkAptLocks();
    if (aptCheck.locked) {
        responseData.push({ error: 'APT locks are in place, aborting further tasks.' });
        return Response.json({ errors: responseData }, { status: 503 });
    }

    // List of critical commands to check
    const commandsToCheck = ['git', 'curl', 'cat', 'ls'];
    for (const cmd of commandsToCheck) {
        const cmdCheck = await checkCommandAvailability(cmd);
        if (!cmdCheck.available) {
            responseData.push({ error: `${cmd} is not available, aborting further tasks.` });
            return Response.json({ errors: responseData }, { status: 503 });
        }
    }

    return Response.json({ success: 'All checks passed, ready to execute tasks.' });
});