import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandExists(command: string): Promise<boolean> {
    const cmd = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const { success } = await cmd.status();
    cmd.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = 'sqlite3'; // Example command to check

    try {
        const exists = await checkCommandExists(command);
        if (!exists) {
            return Response.json({ error: \\`Command ${command} not found. Please install it.\` }, { status: 500 });
        }
        return Response.json({ message: \\`Command ${command} is available.\` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});