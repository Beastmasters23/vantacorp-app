import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaBuildInstaller — generates a fully self-contained installer file.
 */

function buildAgentPython(funcBase, hostname, hive_id) {
    return `import os, sys, time, json, subprocess, socket, platform as _platform
FUNC_BASE = "${funcBase}"
HOSTNAME  = os.environ.get("VANTA_HOSTNAME", "${hostname}" or socket.gethostname().lower())
VANTA_HOME = os.path.join(os.path.expanduser("~"), "vanta")
... [rest of agent code] ...
`;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { target_hostname, employee_name, platform = 'windows', hive_id = '' } = body;

        const appId = Deno.env.get('BASE44_APP_ID') || '6a0dd712a973367ae2c5551a';
        const appUrl = 'https://app--vantachatbase44-app.base44.app';
        const funcBase = `${appUrl}/api/apps/${appId}/functions`;

        const adminName = employee_name || target_hostname;
        const agentPython = buildAgentPython(funcBase, target_hostname, hive_id);

        if (platform === 'windows') {
            const agentB64 = btoa(unescape(encodeURIComponent(agentPython)));
            const ps1Content = \`# Vanta Installer for ${adminName}
... [rest of ps1 code] ...
\`;
            const uploadResp = await base44.asServiceRole.integrations.Core.UploadFile({
                file: new File([ps1Content], \`VantaInstall_\${target_hostname}.ps1\`, { type: 'text/plain' }),
            });
            return Response.json({ status: 'ok', file_url: uploadResp.file_url });
        }
        return Response.json({ error: 'Unsupported platform' }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});