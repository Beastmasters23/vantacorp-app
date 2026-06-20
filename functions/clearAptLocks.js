import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const output = await Deno.run({
            cmd: ['sh', '-c', 'sudo apt-get unlock'], 
            stdout: 'piped', 
            stderr: 'piped'
        });
        const rawOutput = await output.output();
        const rawError = await output.stderrOutput();
        if (rawError.length > 0) {
            throw new Error(new TextDecoder().decode(rawError));
        }
        return new TextDecoder().decode(rawOutput);
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const clearLocksMessage = await clearAptLocks();
        return Response.json({ message: clearLocksMessage }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});