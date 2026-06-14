import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function resolveAPTAndExecute(command) {
    // Function to check and clear APT locks
    const lockCheckCommand = 'test -f /var/lib/dpkg/lock || echo "no lock"';
    const result = await Deno.run({
        cmd: ['bash', '-c', lockCheckCommand],
        stdout: "piped",
        stderr: "piped"
    });
    const output = await result.output();
    const error = await result.stderrOutput();

    // If lock exists, attempt to resolve it
    if (output.length === 0) {
        console.error('APT lock detected, attempting to clear...');
        await Deno.run({ cmd: ['sudo', 'apt-get', 'unlock'], }).status();
        console.info('APT lock cleared.');
    } else {
        console.info('No APT lock detected, proceeding...');
    }

    // Execute the command
    const commandResult = await Deno.run({
        cmd: ['bash', '-c', command],
        stdout: "piped",
        stderr: "piped"
    });
    return await commandResult.output();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = await req.json(); // Expecting command to execute
        const result = await resolveAPTAndExecute(command);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});