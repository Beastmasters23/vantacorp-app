import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandExecutionLog = [];

    async function executeCommand(command) {
        // Pre-check commands
        const commandAvailability = await checkCommandAvailability(command);
        if (!commandAvailability) {
            const errorMsg = \\`Command not found: ${command}\\`;
            commandExecutionLog.push({ command, success: false, error: errorMsg });
            throw new Error(errorMsg);
        }

        let retryCount = 0;
        const maxRetries = 3;
        let commandResult;

        while (retryCount < maxRetries) {
            try {
                commandResult = await Deno.run({
                    cmd: command.split(" "),
                    stdout: "piped",
                    stderr: "piped",
                }).output();
                commandExecutionLog.push({ command, success: true, output: new TextDecoder().decode(commandResult) });
                break; // Successful execution, exit retry loop
            } catch (error) {
                retryCount++;
                const errorMsg = new TextDecoder().decode(error.stderr); 
                commandExecutionLog.push({ command, success: false, error: errorMsg });
                if (retryCount >= maxRetries) {
                    throw new Error(errorMsg || 'Command execution failed.');
                }
            }
        }
    }

    async function checkCommandAvailability(command) {
        // Logic to check if the command is available in the environment
        // For illustrative purposes, assume a simple mock check here to always return true
        return true; // Replace this with the actual check logic
    }

    // Example of executing a command
    try {
        await executeCommand("your-command-here");  // Replace with actual command
        return Response.json({ status: 'Command executed successfully', logs: commandExecutionLog });
    } catch (error) {
        return Response.json({ error: error.message, logs: commandExecutionLog }, { status: 500 });
    }
});