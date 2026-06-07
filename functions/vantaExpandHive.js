import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaExpandHive — generates a personalized node installer for any admin PC.
 */

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { target_hostname, note, target_admin, platform = 'linux' } = body;

        // Robust appUrl fallback
        let appUrl = (Deno.env.get('VANTA_APP_URL') || '').replace(/\/$/, '');
        if (!appUrl || appUrl.startsWith('ghp_')) {
            appUrl = 'https://app--vantachatbase44-app.base44.app';
        }
        const funcBase = `${appUrl}/functions`;
        const deploySecret = Deno.env.get('VANTA_DEPLOY_SECRET') || 'vanta-default-secret';

        // Build signed token (1hr TTL)
        const payload = {
            hostname: target_hostname || 'any',
            exp: Date.now() + 60 * 60 * 1000,
            platform,
        };
        const payloadStr = JSON.stringify(payload);
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            'raw', encoder.encode(deploySecret),
            { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        );
        const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payloadStr));
        const sigHex = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        const token = `${btoa(payloadStr)}.${sigHex}`;

        const deployUrl = `${funcBase}/vantaDeployShell?token=${encodeURIComponent(token)}`;

        // ── Generate platform-specific install command ──
        let installCommand;
        let platformLabel;

        if (platform === 'windows') {
            platformLabel = 'Windows (PowerShell)';
            const psUrl = `${funcBase}/vantaDeployShell?token=${encodeURIComponent(token)}&platform=windows`;
            installCommand = target_hostname
                ? `$env:VANTA_HOSTNAME="${target_hostname}"; iex (irm "${psUrl}")`
                : `iex (irm "${psUrl}")`;
        } else if (platform === 'mac') {
            platformLabel = 'macOS (Terminal)';
            installCommand = target_hostname
                ? `VANTA_HOSTNAME="${target_hostname}" bash <(curl -sSL "${deployUrl}")`
                : `bash <(curl -sSL "${deployUrl}")`;
        } else {
            platformLabel = 'Linux (Terminal)';
            installCommand = target_hostname
                ? `VANTA_HOSTNAME="${target_hostname}" bash <(curl -sSL "${deployUrl}")`
                : `bash <(curl -sSL "${deployUrl}")`;
        }

        const adminNames = { aj: 'AJ', frankie: 'Frankie', other: 'the admin' };
        const adminName = adminNames[target_admin] || user.full_name || 'Admin';

        // Speak the command into chat
        base44.asServiceRole.functions.invoke('vantaSpeak', {
            message: `🐝 **Hive Expansion — ${adminName}'s ${platformLabel} Node**\n\nHere's the install command for **${adminName}**:\n\n\`\`\`${platform === 'windows' ? 'powershell' : 'bash'}\n${installCommand}\n\`\`\`\n\n**Instructions:**\n${platform === 'windows' ? '1. Open **PowerShell**\n2. Paste the command above and press Enter' : '1. Open **Terminal**\n2. Paste the command above and press Enter'}`,
            broadcast: false,
        }).catch(() => {});

        return Response.json({
            status: 'ok',
            install_command: installCommand,
            deploy_url: deployUrl,
            target_hostname: target_hostname || null,
            platform,
            admin: adminName,
        });

    } catch (error) {
        console.error('[vantaExpandHive] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});