import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const commandTimeout = 300; // 5 minutes timeout
const commandChecker = async (command) => {
    try {
        const process = Deno.run({
            cmd: command.split(' '),
            stdout: 'null',
            stderr: 'null',
        });
        await process.status();
    } catch (error) {
        throw new Error(`Command failed: ${error.message}`);
    }
};

const executeWithTimeout = async (command, timeout) => {
    const timer = new Promise((_, reject) => setTimeout(() => reject(new Error('Command timeout')), timeout * 1000));
    const commandExecution = commandChecker(command);
    return Promise.race([commandExecution, timer]);
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { command } = await req.json(); // Assuming command comes in the request body
    try {
        await executeWithTimeout(command, commandTimeout);
        return Response.json({ result: 'Command executed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});