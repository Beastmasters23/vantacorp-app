import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function validateAndExecuteCommand(command) {
        try {
            const process = Deno.run({
                cmd: command,
                stdout: "piped",
                stderr: "piped",
            });

            const output = await process.output();  
            const stderrOutput = await process.stderrOutput();
            process.close();

            const decodedOutput = new TextDecoder().decode(output);
            const decodedStderr = new TextDecoder().decode(stderrOutput);

            // Check both stdout and stderr for expected outputs
            if (decodedStderr) {
                throw new Error(`Command Error: ${decodedStderr}`);
            }

            return decodedOutput;
        } catch (e) {
            console.error(`Failed executing command: ${command.join(' ')}; Error: ${e.message}`);
            return null; // Or handle as needed
        }
    }

    const cleanupCommands = [
        ['command1', 'arg1'],
        ['command2', 'arg2'],
    ];

    for (const command of cleanupCommands) {
        const result = await validateAndExecuteCommand(command);
        if (result === null) {
            console.error(`Failed to execute: ${command.join(' ')}. Skipping to next command.`);
            continue;  // Prevents failure cascade
        }
        console.log(`Executed ${command.join(' ')} successfully. Output: ${result}`);
    }

    return Response.json({ message: 'Commands executed with validation.' });
});
