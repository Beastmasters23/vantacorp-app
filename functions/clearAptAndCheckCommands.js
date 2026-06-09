import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndCheckCommands() {
    // Command to check for APT locks
    const aptLockCheckCommand = "lsof /var/lib/dpkg/lock";
    const commandList = ["cat", "ls", "echo", "grep", "awk"]; // Include essential commands

    // Execute APT lock check
    const aptLockCheck = await Deno.run({
        cmd: aptLockCheckCommand.split(" "),
        stdout: "piped",
        stderr: "null"
    });
    const { success: isAptLocked } = await aptLockCheck.status();

    if (isAptLocked) {
        return { error: "APT is locked. Please resolve the lock before proceeding." };
    }

    // Check for essential command availability
    const unavailableCommands = [];
    for (const command of commandList) {
        const commandCheck = await Deno.run({
            cmd: [`which`, command],
            stdout: "piped",
            stderr: "null"
        });
        const { success } = await commandCheck.status();
        if (!success) {
            unavailableCommands.push(command);
        }
    }

    if (unavailableCommands.length > 0) {
        return { error: `The following commands are unavailable: ${unavailableCommands.join(", ")}` };
    }

    return { success: true };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await clearAPTAndCheckCommands();
        if (result.error) return Response.json({ error: result.error }, { status: 500 });
        return Response.json({ message: "All systems operational." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});