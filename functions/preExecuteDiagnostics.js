import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EXECUTION_TIMEOUT = 300;

async function checkAptLocks() {
    const { output } = await Deno.run({
        cmd: ['bash', '-c', 'if fuser /var/lib/dpkg/lock; then echo 'Locked!'; else echo 'Unlocked!'; fi'],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    return new TextDecoder().decode(output).trim() === 'Unlocked!';
}

async function clearAptLock() {
    await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend'],
    }).status();
}

async function checkCommandAvailability(command) {
    const { status } = await Deno.run({
        cmd: ['bash', '-c', `command -v ${command}`],
    }).status();
    return status === 0;
}

async function preExecuteDiagnostics() {
    const commands = ['cat', 'bash', 'rm']; // critical commands
    const issues = [];

    for (const command of commands) {
        if (!(await checkCommandAvailability(command))) {
            issues.push(`Missing command: ${command}`);
        }
    }

    const aptLockStatus = await checkAptLocks();
    if (!aptLockStatus) {
        await clearAptLock();
        issues.push('Apt lock was cleared.');
    }

    return issues;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const diagnostics = await preExecuteDiagnostics();
        if (diagnostics.length > 0) {
            return Response.json({ diagnostics }, { status: 400 });
        }
        return Response.json({ status: 'Ready to execute tasks' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});