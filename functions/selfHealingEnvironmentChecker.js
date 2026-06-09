import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    // Check for APT locks
    const checkLockCommand = 'fuser -v /var/lib/dpkg/lock';
    const lockCheck = await Deno.run({
        cmd: ["sh", "-c", checkLockCommand],
        stdout: "piped",
        stderr: "piped"
    });

    const { code } = await lockCheck.status();
    if (code === 0) {
        // Clear the lock if found
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], stdout: 'piped', stderr: 'piped' });
    }
}

async function checkForCommands(commands) {
    const unavailableCommands = [];
    for (const command of commands) {
        const cmdCheck = await Deno.run({
            cmd: ["sh", "-c", `command -v ${command}`],
            stdout: "piped",
            stderr: "piped"
        });
        const { code } = await cmdCheck.status();
        if (code !== 0) { unavailableCommands.push(command); }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        const missingCommands = await checkForCommands(['cat', 'some_other_command']); // Add essential commands here
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing essential commands: ${missingCommands.join(', ')}` }, { status: 500 });
        }
        return Response.json({ message: "Environment is ready for task execution." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
