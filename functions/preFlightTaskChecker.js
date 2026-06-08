import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { exec } from "Deno";

async function clearLocks() {
    await exec("sudo rm /var/lib/dpkg/lock-frontend");
    await exec("sudo rm /var/lib/dpkg/lock");
    await exec("sudo rm /var/cache/apt/archives/lock");
}

async function checkOngoingTasks() {
    const { stdout } = await exec("ps -eo state,pid,command");
    const output = new TextDecoder().decode(stdout);
    return output.includes("R") || output.includes("S"); // Runs or Sleeping
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const ongoingTasks = await checkOngoingTasks();
        if (ongoingTasks) {
            console.log("There are ongoing tasks. Please wait.");
            return Response.json({ message: "Ongoing tasks detected; aborting new command." }, { status: 400 });
        }

        await clearLocks();
        return Response.json({ message: "APT locks cleared and ready for new execution." }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});