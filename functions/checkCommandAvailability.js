import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const { exec } = Deno;
    try {
        const { code } = await exec(`command -v ${command}`);
        return code === 0;
    } catch (error) {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandToCheck = 'netstat'; // Example command to check
    const isAvailable = await checkCommandAvailability(commandToCheck);
    if (!isAvailable) {
        return Response.json({ error: `${commandToCheck} command not available` }, { status: 500 });
    }
    // Proceed with further task execution if command is available
    return Response.json({ message: `${commandToCheck} is available` }, { status: 200 });
});