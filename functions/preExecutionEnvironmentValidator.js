import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForLockedApt() {
    try {
        const result = await Deno.run({
            cmd: ["bash", "-c", "test -e /var/lib/apt/lists/lock || echo no"],
            stdout: "piped"
        });
        const output = new TextDecoder().decode(await result.output());
        if (output.trim() !== "no") {
            throw new Error("APT lock detected, please resolve it.");
        }
    } catch (e) {
        console.error(e);
        return false;
    }
    return true;
}

async function checkForEssentialCommands() {
    const commands = ["cat", "echo"];
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ["bash", "-c", `command -v ${cmd}`],
            stdout: "piped",
            stderr: "piped"
        });
        const output = new TextDecoder().decode(await result.output());
        if (!output) {
            console.error(`Command not found: ${cmd}`);
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const aptCheck = await checkForLockedApt();
    const commandCheck = await checkForEssentialCommands();
    
    if (!aptCheck || !commandCheck) {
        return Response.json({ error: "Pre-execution checks failed. Ensure no APT locks and all commands are available." }, { status: 500 });
    }
    
    // Proceed with task execution if checks pass
    return Response.json({ success: "Environment validated. Ready to execute tasks." });
});