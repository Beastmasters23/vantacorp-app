import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const requiredCommands = ['cat', 'grep', 'echo'];

async function checkCommands() {
    const missingCommands = requiredCommands.filter(cmd => !Deno.run({ cmd: [cmd, '--version'] }).status().then(res => res.code === 0));
    return missingCommands.length === 0;
}

async function checkEnvironment() {
    const requiredVars = ['HOME', 'PATH', 'SHELL'];
    const missingVars = requiredVars.filter(varName => !Deno.env.get(varName));
    return missingVars.length === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const areCommandsAvailable = await checkCommands();
        const areEnvVarsSet = await checkEnvironment();

        if (!areCommandsAvailable || !areEnvVarsSet) {
            const errorMessage = `Missing commands: ${!areCommandsAvailable ? requiredCommands.join(', ') : ''} \nMissing env vars: ${!areEnvVarsSet ? requiredVars.join(', ') : ''}`;
            return Response.json({ error: errorMessage }, { status: 400 });
        }

        // Proceed with task execution
        // ...

        return Response.json({ message: 'Task executed successfully!' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});