import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemState() {
    // Check for APT locks
    const lockCheck = await Deno.run({
        cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock']
    });
    const lockCheckStatus = await lockCheck.status();
   
    // Verify crucial command availability
    const commands = ["cat", "ls", "chmod", "chown"];
    const availableCommands = await Promise.all(commands.map(async (cmd) => {
        const commandCheck = await Deno.run({
            cmd: ['which', cmd]
        });
        return commandCheck.status();
    }));
    
    const missingCommands = availableCommands.filter(status => !status.success).map((status, i) => commands[i]);
    
    // Return the check results
    return {
        aptLockExists: lockCheckStatus.success,
        missingCommands,
    };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const systemState = await checkSystemState();
        if (systemState.aptLockExists) {
            return Response.json({ error: "APT lock detected. Please resolve before proceeding." }, { status: 503 });
        }
        if (systemState.missingCommands.length > 0) {
            return Response.json({ error: "Missing commands: " + systemState.missingCommands.join(", ") }, { status: 400 });
        }
        return Response.json({ message: "System state verified. Ready for task execution." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});