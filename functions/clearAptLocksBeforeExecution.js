import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTBeforeExecution() {
    const { exec } = Deno;

    // Check if APT locks are present
    const lockCheckProcess = exec("sudo fuser /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock");
    const output = await lockCheckProcess.status();
    if (output.success) {
        console.log('APT locks detected. Clearing locks...');
        await exec("sudo rm /var/lib/dpkg/lock-frontend");
        await exec("sudo rm /var/lib/dpkg/lock");
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks detected. Proceeding with task execution.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTBeforeExecution();
        // Execute the task logic here
        return Response.json({ message: 'Task executed successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});