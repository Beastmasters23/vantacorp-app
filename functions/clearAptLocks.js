import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean && sudo apt-get autoremove'],
        stdout: "piped", 
        stderr: "piped"
    });
    const { success } = await exec.status();
    const output = await exec.output();
    const errorOutput = await exec.stderrOutput();
    exec.close();
    return { success, output, errorOutput }; 
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { success, output, errorOutput } = await clearAptLocks();
        if (!success) {
            throw new Error(new TextDecoder().decode(errorOutput));
        }
        return Response.json({ message: 'APT locks cleared successfully', result: new TextDecoder().decode(output) });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});