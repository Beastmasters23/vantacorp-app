import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "https://deno.land/x/exec/mod.ts";

async function preCheckAndInstallCommands(commands: string[]) {
    for (const command of commands) {
        const checkCommand = await exec(`command -v ${command}`);
        if (checkCommand.code !== 0) {
            console.log(`${command} not found. Attempting to install...`);
            await exec(`sudo apt-get install -y ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'grep'];  // Add more as needed
    await preCheckAndInstallCommands(requiredCommands);
    return Response.json({ message: 'Pre-check and installation complete.' }, { status: 200 });
});