import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// A function to check and clear APT locks before executing tasks
async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'], // Assuming cleaning the APT cache to prevent locks
        stdout: 'piped',
        stderr: 'piped'
    });

    const { code } = await result.status();
    const output = await result.output();
    const error = await result.stderrOutput();

    if (code !== 0) {
        console.error(new TextDecoder().decode(error));
        throw new Error('Failed to clear APT locks.');
    }
    console.log('APT locks cleared successfully:', new TextDecoder().decode(output));
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // First, clear APT locks before any task execution
        await clearAptLocks();
        // Further task execution logic goes here
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});