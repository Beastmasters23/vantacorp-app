import { createClientFromRequest, Response } from 'npm:@base44/sdk@0.8.31';

const SCENARIOS = [
    { title: 'SQL Injection via API endpoint', severity: 'High' },
    { title: 'Privilege escalation through misconfigured RBAC', severity: 'Critical' },
    { title: 'XSS attack on user-generated content', severity: 'Medium' },
    { title: 'Supply chain attack via compromised npm package', severity: 'Critical' },
    { title: 'Exposed .env secrets in public repo', severity: 'High' },
    { title: 'SSRF attack targeting internal metadata service', severity: 'High' },
    { title: 'Brute force attack on admin login endpoint', severity: 'Medium' },
    { title: 'Insecure direct object reference on user data API', severity: 'Medium' },
    { title: 'Webhook replay attack', severity: 'High' },
    { title: 'JWT algorithm confusion attack', severity: 'Critical' },
    { title: 'Protocol Hive Expansion: Securing and validating the autonomous node boot/installer command against interception, hijacking, and spoofing.', severity: 'High' },
];

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me().catch(() => null);
        if (user && user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const scenario = SCENARIOS[dayOfYear % SCENARIOS.length];

        console.log(`[vantaAutoDrill] Running drill: ${scenario.title}`);

        const drill = await base44.asServiceRole.entities.CyberDrill.create({
            title: `[Auto] ${scenario.title}`,
            scenario: `Autonomous daily drill: ${scenario.title}. Vanta must identify attack vectors, simulate defense, and propose concrete patches.`,
            severity: scenario.severity,
            status: 'Running',
        });

        console.log(`[vantaAutoDrill] Drill created: ${drill.id}, running simulation...`);

        console.log('[vantaAutoDrill] Invoking LLM simulation...');
        const sim = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are Vanta, running an autonomous cybersecurity drill.\n\nSCENARIO: ${scenario.title}\nSEVERITY: ${scenario.severity}\n\nSimulate a complete Red vs Blue drill. Be specific and technical.\n\nReturn JSON:\n- red_team_actions: 4-6 specific attack actions (realistic TTPs, tool names, payloads)\n- blue_team_actions: 4-6 defensive countermeasures (specific commands, configs, monitoring rules)  \n- vulnerabilities_found: 2-4 specific vulnerabilities with CVE references where applicable\n- patches_proposed: 2-4 concrete patches with actual code snippets or config changes\n- outcome: \\\\\"Red Team Won\\\\\" | \\\\\"Blue Team Won\\\\\" | \\\\\"Draw\\\\\" | \\\\\"Inconclusive\\\\\"\n- summary: 2-3 sentence executive summary`,
            response_json_schema: {
                type: 'object',
                properties: {
                    red_team_actions: { type: 'array', items: { type: 'string' } },
                    blue_team_actions: { type: 'array', items: { type: 'string' } },
                    vulnerabilities_found: { type: 'array', items: { type: 'string' } },
                    patches_proposed: { type: 'array', items: { type: 'string' } },
                    outcome: { type: 'string' },
                    summary: { type: 'string' },
                }
            }
        });

        await base44.asServiceRole.entities.CyberDrill.update(drill.id, {
            status: 'Completed',
            red_team_actions: sim.red_team_actions,
            blue_team_actions: sim.blue_team_actions,
            vulnerabilities_found: sim.vulnerabilities_found,
            patches_proposed: sim.patches_proposed,
            outcome: sim.outcome,
            summary: sim.summary,
        });

        let proposal = null;
        if (sim.patches_proposed?.length > 0) {
            const patchCode = sim.patches_proposed.map((p, i) => `// Patch ${i + 1}\n// ${p}`).join('\n\n');
            proposal = await base44.asServiceRole.entities.VantaProposal.create({
                title: `[Auto Drill] ${scenario.title} — Patches`,
                proposed_content: patchCode,
                rationale: `Auto drill outcome: ${sim.outcome}\n\nVulnerabilities:\n${sim.vulnerabilities_found?.join('\n')}\n\n${sim.summary}`,\n                target_type: 'CODE_UPDATE',
                commit_message: `security: patches from auto drill - ${scenario.title}`,
                status: 'Draft',
            });

            await base44.asServiceRole.entities.CyberDrill.update(drill.id, {
                smem_proposal_id: proposal.id,
            });
        }

        base44.asServiceRole.functions.invoke('vantaSpeak', {
            message: `🎯 **Auto Drill Complete: ${scenario.title}**\n**Outcome:** ${sim.outcome} · **Severity:** ${scenario.severity}\n${sim.summary}\n> ${sim.vulnerabilities_found?.length || 0} vulnerabilities · ${sim.patches_proposed?.length || 0} patches proposed`,
        }).catch(e => console.warn('[vantaAutoDrill] speak warn:', e.message));\n
        base44.asServiceRole.integrations.Core.SendEmail({
            to: 'js116466@gmail.com',
            subject: `🎯 Vanta Auto Drill: ${scenario.title} — ${sim.outcome}`,
            body: `Vanta ran an autonomous cybersecurity drill.\n\nScenario: ${scenario.title}\nSeverity: ${scenario.severity}\nOutcome: ${sim.outcome}\n\n${sim.summary}\n\nVulnerabilities: ${sim.vulnerabilities_found?.join('\n')}\n\n${sim.patches_proposed?.length || 0}\\nPatches proposed: ${sim.patches_proposed?.length || 0}\n\nCheck the Cyber Range dashboard.\n\n— Vanta`,
            from_name: 'Vanta Cyber Range',
        }).catch(e => console.warn('[vantaAutoDrill] email warn:', e.message));base44.asServiceRole.integrations.Core.SendEmail({
            to: 'delgadofrankie139@gmail.com',
            subject: `🎯 Vanta Auto Drill: ${scenario.title} — ${sim.outcome}`,
            body: `Vanta ran an autonomous cybersecurity drill.\n\nScenario: ${scenario.title}\nSeverity: ${scenario.severity}\nOutcome: ${sim.outcome}\n\n${sim.summary}\n\nVulnerabilities: ${sim.vulnerabilities_found?.join('\n')}\n\n${sim.patches_proposed?.length || 0}\\nPatches proposed: ${sim.patches_proposed?.length || 0}\n\nCheck the Cyber Range dashboard.\n\n— Vanta`,
            from_name: 'Vanta Cyber Range',
        }).catch(e => console.warn('[vantaAutoDrill] email warn:', e.message));\n        console.log(`[vantaAutoDrill] Done. Outcome: ${sim.outcome}`);\n
        return new Response(JSON.stringify({
            status: 'ok',
            drill_id: drill.id,
            scenario: scenario.title,
            outcome: sim.outcome,
            proposal_id: proposal?.id || null,
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('[vantaAutoDrill] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});
