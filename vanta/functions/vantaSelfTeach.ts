import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaSelfTeach — Vanta's autonomous self-learning engine.
 * Modes: 'gaps' | 'research' | 'outcomes' | 'swarm_sync'
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const body = await req.json().catch(() => ({}));
        const { mode } = body;

        const results = {};

        // --- NEW MODE: SWARM_SYNC ---
        // Specialized mode for the swarm daemon to pick up work
        if (mode === 'swarm_sync') {
            // 1. Run Node Watchdog (proactive detection)
            await base44.asServiceRole.functions.invoke('vantaNodeWatchdog', {}).catch(() => {});
            
            // 2. Fetch Failed Tasks
            const failedTasks = await base44.asServiceRole.entities.VantaTask.filter({
                status: 'Failed'
            }, '-updated_date', 10);
            
            // 3. Fetch Recent Swarm Healing Logs
            const recentHealing = await base44.asServiceRole.entities.VantaHealingLog.filter({
                summary: { "$regex": "^\\\\[SWARM-HOTFIX\\\\]" }
            }, '-created_date', 20);

            return Response.json({
                status: 'ok',
                mode: 'swarm_sync',
                failed_tasks: failedTasks,
                recent_healing_triggers: recentHealing.map(h => h.trigger),
                timestamp: new Date().toISOString()
            });
        }

        // --- EXISTING MODES ---

        // ── 1. SELF-DIRECTED LEARNING: read logs, find gaps, propose fixes ──
        if (!mode || mode === 'gaps') {
            try {
                const [healingLogs, proposals, tasks] = await Promise.all([
                    base44.asServiceRole.entities.VantaHealingLog.list('-created_date', 20),
                    base44.asServiceRole.entities.VantaProposal.filter({ status: 'Rejected' }),
                    base44.asServiceRole.entities.VantaTask.filter({ status: 'Failed' }),
                ]);

                const failedSummaries = tasks.slice(0, 10).map(t =>
                    `Task: ${t.directive?.slice(0, 100)} | Exit: ${t.exit_code} | Output: ${t.output?.slice(0, 200)}`
                ).join('\n');

                const rejectedSummaries = proposals.slice(0, 5).map(p =>
                    `Proposal: ${p.title} | Rationale: ${p.rationale?.slice(0, 150)}`
                ).join('\n');

                const healingSummaries = healingLogs.slice(0, 10).map(l =>
                    `Log: ${l.summary} | Status: ${l.status}`
                ).join('\n');

                const gapAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `You are Vanta, an autonomous AI agent analyzing your own operational history to identify knowledge gaps and improvement areas.\n\nRECENT FAILED TASKS:\n${failedSummaries || 'None'}\n\nREJECTED PROPOSALS:\n${rejectedSummaries || 'None'}\n\nRECENT HEALING LOGS:\n${healingSummaries || 'None'}\n\nAnalyze these and identify:\n1. Recurring failure patterns\n2. Knowledge gaps causing failures\n3. ONE specific, actionable improvement you should make to yourself right now\n\nReturn JSON: { "patterns": ["..."], "gaps": ["..."], "top_improvement": { "title": "...", "description": "...", "rationale": "..." } }`,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            patterns: { type: 'array', items: { type: 'string' } },
                            gaps: { type: 'array', items: { type: 'string' } },
                            top_improvement: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    rationale: { type: 'string' }
                                }
                            }
                        }
                    }
                });

                results.gap_analysis = gapAnalysis;

                await base44.asServiceRole.entities.VantaHealingLog.create({
                    trigger: 'vantaSelfTeach — gap analysis cycle',
                    language: 'system',
                    issues_found: gapAnalysis.patterns?.map(p => ({ pattern: p })) || [],
                    summary: `[SELF-TEACH] Gap analysis: found ${gapAnalysis.gaps?.length || 0} gaps. Top improvement: ${gapAnalysis.top_improvement?.title || 'none'}`,
                    status: 'Fixed',
                    pr_created: false,
                });

            } catch (e) {
                results.gap_error = e.message;
            }
        }

        // ── 2. WEB RESEARCH → BRAIN NODES ──────────────────────────────────
        if (!mode || mode === 'research') {
            try {
                const [brainNodes, recentTasks] = await Promise.all([
                    base44.asServiceRole.entities.VantaBrainNode.filter({ status: 'Ready' }),
                    base44.asServiceRole.entities.VantaTask.list('-created_date', 5),
                ]);

                const recentDirectives = recentTasks.map(t => t.directive?.slice(0, 100)).join(', ');

                const topicRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `You are Vanta. Based on your recent work: "${recentDirectives}", pick ONE specific technical topic to research right now that would make you more capable. Return JSON: { "topic": "...", "search_query": "..." }`,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            topic: { type: 'string' },
                            search_query: { type: 'string' }
                        }
                    }
                });

                const researchRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `Research this topic thoroughly: "${topicRes.topic}". Search query: "${topicRes.search_query}". \n                    \nSummarize what you learned into structured knowledge that an AI agent can apply immediately. Include: key concepts, practical patterns, common pitfalls, and how to apply this in a Linux/Deno/shell environment.\n\nReturn JSON: { "topic": "...", "key_concepts": ["..."], "practical_patterns": ["..."], "pitfalls": ["..."], "summary": "..." }`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            topic: { type: 'string' },
                            key_concepts: { type: 'array', items: { type: 'string' } },
                            practical_patterns: { type: 'array', items: { type: 'string' } },
                            pitfalls: { type: 'array', items: { type: 'string' } },
                            summary: { type: 'string' }
                        }
                    }
                });

                const targetNode = brainNodes.find(n => n.specialization === 'language' || n.specialization === 'pattern');
                if (targetNode) {
                    const existingKnowledge = targetNode.knowledge_data || {};
                    const updatedKnowledge = {
                        ...existingKnowledge,
                        research: [
                            ...(existingKnowledge.research || []).slice(-9),
                            { ...researchRes, learned_at: new Date().toISOString() }
                        ]
                    };
                    await base44.asServiceRole.entities.VantaBrainNode.update(targetNode.id, {
                        knowledge_data: updatedKnowledge,
                        knowledge_version: (targetNode.knowledge_version || 0) + 1,
                        knowledge_summary: `Latest research: ${researchRes.topic} — ${researchRes.summary?.slice(0, 200)}`,
                        last_sync: new Date().toISOString(),
                        log: [...(targetNode.log || []).slice(-19), `[${new Date().toISOString()}] Learned: ${researchRes.topic}`]
                    });
                }

                results.research = { topic: researchRes.topic, summary: researchRes.summary };

            } catch (e) {
                results.research_error = e.message;
            }
        }

        // ── 3. LEARN FROM TASK OUTCOMES → REASONING BRAIN NODE ────────────
        if (!mode || mode === 'outcomes') {
            try {
                const recentTasks = await base44.asServiceRole.entities.VantaTask.list('-updated_date', 30);
                const completed = recentTasks.filter(t => t.status === 'Completed');
                const failed = recentTasks.filter(t => t.status === 'Failed');

                const outcomeData = {
                    completed: completed.slice(0, 10).map(t => ({
                        directive: t.directive?.slice(0, 100),
                        language: t.language,
                        exit_code: t.exit_code,
                        output_snippet: t.output?.slice(0, 150)
                    })),
                    failed: failed.slice(0, 10).map(t => ({
                        directive: t.directive?.slice(0, 100),
                        language: t.language,
                        exit_code: t.exit_code,
                        output_snippet: t.output?.slice(0, 150)
                    }))
                };

                const lessonsRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: `You are Vanta analyzing your own task execution history to extract lessons.\n\nCOMPLETED TASKS (${outcomeData.completed.length}):\n${JSON.stringify(outcomeData.completed, null, 2)}\n\nFAILED TASKS (${outcomeData.failed.length}):\n${JSON.stringify(outcomeData.failed, null, 2)}\n\nExtract actionable lessons. What directive patterns succeed? What fails and why? What should you do differently?\n\nReturn JSON: { "success_patterns": ["..."], "failure_causes": ["..."], "lessons": ["..."], "confidence_score": 0-100 }`,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            success_patterns: { type: 'array', items: { type: 'string' } },
                            failure_causes: { type: 'array', items: { type: 'string' } },
                            lessons: { type: 'array', items: { type: 'string' } },
                            confidence_score: { type: 'number' }
                        }
                    }
                });

                const reasoningNodes = await base44.asServiceRole.entities.VantaBrainNode.filter({ specialization: 'reasoning' });
                if (reasoningNodes.length > 0) {
                    const node = reasoningNodes[0];
                    const existingKnowledge = node.knowledge_data || {};
                    await base44.asServiceRole.entities.VantaBrainNode.update(node.id, {
                        knowledge_data: {
                            ...existingKnowledge,
                            task_lessons: lessonsRes,
                            last_outcome_analysis: new Date().toISOString(),
                            task_sample_size: recentTasks.length
                        },
                        knowledge_version: (node.knowledge_version || 0) + 1,
                        accuracy_score: lessonsRes.confidence_score || node.accuracy_score,
                        knowledge_summary: `Lessons from ${recentTasks.length} tasks: ${lessonsRes.lessons?.slice(0, 2).join('; ')}`,
                        last_sync: new Date().toISOString(),
                        log: [...(node.log || []).slice(-19), `[${new Date().toISOString()}] Outcome analysis: ${completed.length} success, ${failed.length} failed`]
                    });
                }

                results.outcomes = {
                    tasks_analyzed: recentTasks.length,
                    lessons: lessonsRes.lessons,
                    confidence_score: lessonsRes.confidence_score
                };

            } catch (e) {
                results.outcomes_error = e.message;
            }
        }

        // ── Broadcast summary (only for non-swarm modes) ─────────────────────
        const summaryLines = [];
        if (!mode || mode !== 'swarm_sync') {
            if (results.gap_analysis?.top_improvement) summaryLines.push(`🔍 Gap identified: **${results.gap_analysis.top_improvement.title}**`);
            if (results.research?.topic) summaryLines.push(`📚 Researched: **${results.research.topic}**`);
            if (results.outcomes?.lessons?.length) summaryLines.push(`🧠 Learned ${results.outcomes.lessons.length} lessons from ${results.outcomes.tasks_analyzed} tasks (confidence: ${results.outcomes.confidence_score}%)`);
        }

        if (summaryLines.length > 0) {
            base44.asServiceRole.functions.invoke('vantaSpeak', {
                message: `🎓 **Self-Teaching Cycle Complete**\n\n${summaryLines.join('\n')}\n\nI'm getting smarter. No input required.`,
            }).catch(e => console.warn('[vantaSelfTeach] speak warn:', e.message));
        }

        return Response.json({ status: 'ok', results });

    } catch (error) {
        console.error('[vantaSelfTeach] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
