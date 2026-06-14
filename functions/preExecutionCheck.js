import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = commands.filter(cmd => !Deno.run({cmd: ["which", cmd]}).status());
    return missingCommands.length === 0 ? true : missingCommands;
}

async function checkAPTStatus() {
    const result = Deno.run({cmd: ["sudo", "lsof", "/var/lib/dpkg/lock"]});
    return (await result.status()).success ? false : true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ["cat", "sudo", "apt-get", "echo"];
    const resourcesAreAvailable = await checkAPTStatus();
    const commandsAreAvailable = await checkCommandAvailability(criticalCommands);

    if (!resourcesAreAvailable) {
        return Response.json({ error: "APT lock detected. Please clear locks before executing tasks." }, {status: 503});
    }
    if (commandsAreAvailable !== true) {
        return Response.json({ error: `Missing commands: ${commandsAreAvailable.join(', ')}` }, { status: 400 });
    }
    
    // Proceed to execute the task since all checks have passed
    return Response.json({ message: "All systems are operational, task can be executed." }, { status: 200 });
});