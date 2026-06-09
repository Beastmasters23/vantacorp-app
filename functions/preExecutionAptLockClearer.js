import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const unlockCommand = "sudo fuser -vki /var/lib/dpkg/lock-frontend"; // Command to unlock APT
        const unlockProcess = Deno.run({
            cmd: unlockCommand.split(' '),
            stdout: "piped",
            stderr: "piped"
        });

        const { code } = await unlockProcess.status();
        if (code !== 0) {
            const errorOutput = await unlockProcess.output();
            const errorString = new TextDecoder().decode(errorOutput);
            return Response.json({ error: `Failed to unlock APT: ${errorString}` }, { status: 500 });
        }
        return Response.json({ message: 'APT lock cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});