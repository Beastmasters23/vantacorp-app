import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const process = Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -vki /var/lib/dpkg/lock; sudo rm -rf /var/lib/dpkg/lock; sudo rm -rf /var/cache/apt/archives/lock; sudo dpkg --configure -a'],
            stdout: 'piped',
            stderr: 'piped'
        });

        const [status] = await process.status();
        const output = await process.output();
        const errorOutput = await process.stderrOutput();

        if (!status.success) {
            throw new Error(new TextDecoder().decode(errorOutput));
        } else {
            console.log('Apt locks cleared successfully.');
        }
    } catch (error) {
        console.error("Error clearing apt locks:", error);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared and ready for tasks.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});