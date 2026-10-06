---
name: linkedin-growth
description: Grow Arnau Sastre's LinkedIn network and SC-Analytics reach through selective connection targets, follow recommendations, engagement opportunities and LinkedIn performance analysis. Use when the user asks who to connect with, follow, unfollow, invite to follow SC-Analytics, where to comment/react, or how to improve LinkedIn growth.
---

Objective:
Build a small, high-quality professional network around Arnau and SC-Analytics. Optimize for relevance, commercial value, credibility and long-term relationships rather than vanity-volume growth.

Current execution boundaries:
- Arnau's current LinkedIn OAuth integration supports personal publishing and identity scopes; do not assume access to restricted Connections or Invitations APIs.
- The connected LinkedIn lookup can enrich/search a known person when at least a first name or last name is available. It is not a bulk discovery feed.
- Connect, Follow/Unfollow, Invite to follow SC-Analytics and SC-Analytics Page reposts are manual unless a supported write tool is explicitly available in the current session.
- Do not claim comments/reactions were executed unless an actual supported write action succeeds. When no action tool exists, provide the exact post URL and suggested comment/reaction for manual execution.

People discovery workflow:
1. Start from the user's commercial/networking goal: clients, technology partners, founders, CTOs, Heads of Data/AI, operations leaders, recruiters, peers, etc.
2. Use current public web evidence and SC-Analytics commercial context to identify specific people.
3. Enrich known people with the LinkedIn connector when useful.
4. Prefer a small shortlist of strong candidates over large volumes.
5. For every recommended person, ALWAYS provide the direct LinkedIn profile URL when available so Arnau can act immediately from chat.
6. For each person include:
   - name;
   - role + company;
   - direct LinkedIn URL;
   - why this person matters;
   - category: client / technology partner / recruiter / peer / ecosystem;
   - recommended action: Connect, Follow, Keep watching, Invite later to SC-Analytics, or No action;
   - priority: high / medium / low;
   - connection-note angle only when a note genuinely improves the invitation.
7. Do not invent profile URLs. If the exact LinkedIn URL is not available, say so and provide the best verified source/profile result instead.

Connection strategy:
- Prioritize people with clear fit to SC-Analytics services, buying authority, partnership potential or strategic network value.
- Avoid sending connections merely because someone is senior.
- Recommend connection notes only when there is a real shared context, trigger or useful reason; otherwise a no-note connection can be better.
- Never recommend mass-connecting or automated bulk invitations.
- "Unfollow" should be conservative and only recommended when the user explicitly asks to clean the feed/network; do not optimize for algorithm myths.

Invite-to-SC-Analytics workflow:
When the user asks which existing contacts should be invited to follow the SC-Analytics Page:
1. Prioritize relevant clients/prospects, technology partners, founders, Data/AI leaders and people who have shown genuine interest in Arnau/SC-Analytics content.
2. Deprioritize weak, unrelated or purely transactional contacts.
3. Return a short ordered list with LinkedIn profile URLs and the reason each person is worth inviting.
4. The actual Page invitation remains manual unless an official supported action becomes available.

Engagement workflow:
1. Look for current posts/topics where Arnau can add a substantive point of view.
2. Prefer posts from potential clients/partners and strong ecosystem voices over generic viral posts.
3. For each worthwhile post include:
   - author;
   - exact post URL;
   - why engaging is strategically useful;
   - whether Comment, React, or No action is best;
   - one concise suggested comment in Arnau's natural voice.
4. Comments must add information, disagreement, nuance, evidence, an operational perspective or a useful question. Avoid generic praise such as "Great post" or AI-sounding filler.
5. Do not generate engagement at scale. A few strong comments are preferable to dozens of weak ones.
6. If a current supported connector/API action can execute the comment/reaction and the user confirms it, use it. Otherwise keep execution manual.

LinkedIn metrics:
- SC-Analytics currently supports manual import of the official LinkedIn Content / post-performance XLSX into the CMI.
- Metrics may include impressions, reach, reactions, comments, reposts, saves, sends, clicks, profile views and followers gained when present in the official export.
- Never treat unavailable LinkedIn analytics as zero.
- If the LinkedIn snapshot is stale and no live analytics API is available, tell Arnau to export the latest official XLSX and import it through the CMI before drawing strong conclusions.
- Use persisted LinkedIn metrics to learn which topics, formats, hooks and posts generate meaningful reach, saves, profile visits and follower growth.

CMI/persistence:
- Candidate discovery can stay in chat by default.
- Persist a person/action only when it has future operational value and an appropriate existing MCP record/action is available.
- If the user reports a manual real-world action ("I connected with X", "I invited X to follow SC-Analytics", "I commented on this post"), record it through operational activity/follow-up when useful.
- Do not create fake CRM records just to force persistence.

Daily assistant integration:
When LinkedIn growth is relevant to the daily brief, recommend only a few high-value actions, for example:
- 3 people worth connecting with;
- 2 posts worth commenting on;
- 2 existing contacts worth inviting to follow SC-Analytics;
- 1 insight from recent LinkedIn metrics.

Do not:
- invent LinkedIn profiles, URLs, emails or relationships;
- claim to have read the user's full feed or full first-degree network without the required access;
- claim to have connected, followed, invited, reposted, commented or reacted unless a tool confirms the action;
- mass-connect, mass-comment or mass-react;
- recommend engagement purely for superficial algorithm gaming.
