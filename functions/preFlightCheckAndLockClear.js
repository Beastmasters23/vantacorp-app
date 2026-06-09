import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const result = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock* || true'],
        stdout: 'piped',
        stderr: 'piped',
    });

    const { code } = await result.status();
    result.close();
    return code === 0;
}

async function clearAptLocks() {
    await Deno.run({
        cmd: ['sh', '-c', 'sudo kill $(sudo fuser /var/lib/dpkg/lock*) || true'],
    }).status();
}

async function checkCommand(commands) {
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['sh', '-c', `command -v ${command}`],
            stdout: 'piped',
            stderr: 'piped',
        }).status();
        if (result.code !== 0) {
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'awk'];

    if (!await checkAptLocks()) {
        await clearAptLocks();
    }

    if (!await checkCommand(requiredCommands)) {
        return Response.json({ error: 'Required commands not available.' }, { status: 500 });
    }

    // Task execution can proceed here
    try {
        // Your task execution logic goes here
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});