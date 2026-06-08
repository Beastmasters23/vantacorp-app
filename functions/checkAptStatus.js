import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptStatus = await checkAptStatus();
        if (aptStatus.locked) {
            return Response.json({ error: 'APT is currently locked. Status: ' + aptStatus.message }, { status: 424 }); // Failed Dependency
        }
        // Proceed with your regular task logic here
        return Response.json({ message: 'System is clear for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAptStatus() {
    const { exec } = Deno;
    try {
        const { stdout } = await exec("sudo lsof /var/lib/dpkg/lock");
        if (stdout.length > 0) {
            return { locked: true, message: 'Another process is using APT.' };
        }
        return { locked: false, message: 'APT is free for use.' };
    } catch (error) {
        return { locked: false, message: 'Error accessing APT status: ' + error.message };
    }
}