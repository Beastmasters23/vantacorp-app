import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPT() {
    const command = 'sudo fuser -vki /var/lib/dpkg/lock';
    const result = await Deno.run({
        cmd: ['sh', '-c', command],
        stdout: 'piped',
        stderr: 'piped',
    });

    const output = await result.output();
    const errorOutput = await result.stderrOutput();

    result.close();
    return errorOutput.length === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isClear = await checkAndClearAPT();
        if (!isClear) {
            return Response.json({ error: 'APT locks could not be cleared' }, { status: 409 });
        }
        // Implement the main task logic here, ensuring it's only reached if APT is clear
        return Response.json({ message: 'APT lock resolved, task can proceed' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});