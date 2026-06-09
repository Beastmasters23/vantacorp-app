import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ["which", command],
        stdout: "piped"
    });
    const output = await process.output();
    process.close();
    return output.length > 0;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ["sudo", "fuser", "-k", "/var/lib/dpkg/lock-*"], stdout: "piped" }).status();
    } catch (e) {
        console.error("Failed to clear apt locks", e);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'grep', 'ls'];
    let missingCommands = [];
    for (const command of criticalCommands) {
        if (!(await checkCommandAvailability(command))) {
            missingCommands.push(command);
        }
    }

    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }

    await clearAptLocks();

    return Response.json({ status: 'All checks passed, ready for task execution.' });
});