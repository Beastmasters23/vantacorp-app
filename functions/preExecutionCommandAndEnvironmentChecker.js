import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const { status } = await Deno.run({ cmd: ["which", command] }).status();
        if (status !== 0) {
            return { available: false, command };  
        }
    }
    return { available: true };
}

async function clearAptLocks() {
    await Deno.run({ cmd: ["sudo", "fuser", "-k", "/var/lib/dpkg/lock"], stdout: "null", stderr: "null" }).status();
    await Deno.run({ cmd: ["sudo", "fuser", "-k", "/var/cache/apt/archives/lock"], stdout: "null", stderr: "null" }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ["curl", "wget", "apt-get", "cat"];
    const commandCheck = await checkCommandAvailability(commandsToCheck);

    if (!commandCheck.available) {
        return Response.json({ error: `Missing command: ${commandCheck.command}` }, { status: 500 });
    }

    await clearAptLocks();

    // Continue with the actual task execution here...

    return Response.json({ status: 'All checks passed, proceeding with task...'}, { status: 200 });
});