import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandResponse(command) {
    const process = Deno.run({
        cmd: command.split(" "),
        stdout: "piped",
        stderr: "piped"
    });

    const { code } = await process.status();
    const rawOutput = await process.output();
    const rawError = await process.stderrOutput();

    const output = new TextDecoder().decode(rawOutput);
    const errorOutput = new TextDecoder().decode(rawError);

    const response = { code, output, errorOutput };
    process.close();
    return response;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = [
        'CAT',
        'SYSTEMCTL STATUS',
        'VALIDATE COMMANDS HERE'
    ];

    try {
        const commandResults = await Promise.all(commandsToCheck.map(checkCommandResponse));
        const failures = commandResults.filter(res => res.code !== 0);

        if (failures.length > 0) {
            return Response.json({ error: 'One or more commands failed', details: failures }, { status: 500 });
        }

        return Response.json({ message: 'All commands executed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});