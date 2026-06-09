import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
async function checkAptAndCommand(command) {
    const aptLockCheck = await Deno.run({
        cmd: ['sh', '-c', 'if lsof /var/lib/dpkg/lock-frontend; then echo "locked"; fi'],
        stdout: 'piped',
    });

    const output = new TextDecoder().decode(await aptLockCheck.output());
    if (output.includes('locked')) {
        throw new Error('APT is currently locked.');
    }

    const commandCheck = await Deno.run({
        cmd: ['sh', '-c', `command -v ${command}`],
        stdout: 'piped',
    });

    const commandOutput = new TextDecoder().decode(await commandCheck.output());
    if (!commandOutput.trim()) {
        throw new Error(`Command not found: ${command}`);
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasks = ["cat", "grep", "ls"].map(command => checkAptAndCommand(command));
    await Promise.all(tasks);
    return Response.json({ status: 'pre-checks passed' }, { status: 200 });
});