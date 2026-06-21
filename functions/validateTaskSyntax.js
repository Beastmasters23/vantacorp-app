import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const taskCommands = [
  'Directive: "Final ID synchronization for Penguin brain nodes."',
  'Directive: "Update all brain node IDs on penguin to match the dashboard records and restart them."',
  'Directive: "[FileEdit:read] Read file /vanta/bridge/teamwork_protocol.json"',
  'Directive: "[ID-Grep-Global-Dta] Grep for names and IDs in gobal dta.txt on Windows."',
  'Directive: "List all open windows on AJ-Windows-Node-Final"'
];

const syntaxErrors = [];

function validateCommand(command) {
    // Check for balanced parentheses, brackets, and quotes
    const parenCount = (command.match(/\(/g) || []).length - (command.match(/\)/g) || []).length;
    const bracketCount = (command.match(/\{/g) || []).length - (command.match(/\}/g) || []).length;
    const quoteCount = (command.match(/"/g) || []).length % 2;

    if (parenCount !== 0 || bracketCount !== 0 || quoteCount !== 0) {
        syntaxErrors.push(`Syntax error in command: ${command}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        taskCommands.forEach(validateCommand);

        if (syntaxErrors.length > 0) {
            return Response.json({ errors: syntaxErrors }, { status: 400 });
        }

        // Proceed with task execution if there are no syntax errors
        return Response.json({ message: 'All commands validated successfully' }, { status: 200 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});