# SC-Analytics — Language Strategy

## Supported languages
SC-Analytics editorial content supports:
- Spanish (`es`)
- English (`en`)
- Catalan (`ca`)

## Principle
Do not translate mechanically. Create a canonical content brief first, then write a native editorial version for each requested language while preserving the same thesis, evidence, nuance and business meaning.

A Spanish post, English post and Catalan post are siblings from the same brief, not sentence-by-sentence translations.

## Shared identity across languages
All three languages must preserve the same underlying reasoning style:
- direct;
- explanatory;
- pragmatic;
- technically credible without unnecessary jargon;
- visibly structured when the argument is complex;
- willing to discuss trade-offs and limitations;
- sceptical of complexity without business justification;
- professional without sounding bureaucratic;
- conversational enough to sound human, but written rather than transcribed speech.

The prose should normally explain `what`, `why`, `how` and `what changes in practice`. Naming a technology is not an explanation.

## Spanish
Spanish is the default for Spain-wide business content unless the audience or topic clearly suggests another language.

Style target:
- classical, direct and explanatory;
- natural paragraphs rather than chains of isolated one-liners;
- formal enough for decision-makers without institutional or bureaucratic phrasing;
- explicit causal reasoning and practical conclusions;
- no literal Catalan syntax.

Use `voice/written_style_es.md` for drafting and criticism.

## Catalan
Catalan should be native, rigorous and explanatory rather than deliberately colloquial. The preferred cadence comes from Arnau's academic/expository writing: introduce the point, explain it, develop the reasoning and state the consequence.

Use transitions such as `En primer lloc`, `Tot seguit`, `Tanmateix`, `Per tant`, `Això implica` or `Finalment` only when they improve the logic. Do not turn posts into academic papers.

Use `voice/written_style_ca.md` for drafting and criticism.

## English
English should be direct, precise and calm. Preserve the clarity and explicit conditions visible in Arnau's professional English writing, but do not import contractual/legal tone into editorial content.

Prefer:
- concrete verbs;
- clear scope and conditions;
- careful qualification;
- short causal explanations;
- natural business English rather than startup jargon.

Use `voice/written_style_en.md` for drafting and criticism.

## Default use by channel
- Arnau personal LinkedIn: choose one primary language according to audience/topic. Spanish is a strong default for Spain-wide business content; English for international reach; Catalan when local relevance or audience makes it natural.
- SC-Analytics company channels: support all three languages, but avoid publishing three near-identical versions at the same time without a clear distribution reason.
- Website articles: strategic pieces should support dedicated language variants. The public website UI may be rolled out language-by-language, but the editorial data model can store all variants from the beginning.

## Terminology
Keep established technical terms in English when that is natural for the target audience (for example `forecasting`, `machine learning`, `business intelligence`) unless a clear local equivalent reads better. Consistency matters more than forced translation.

## Localisation quality gate
Reject a language variant when:
- it reads like a translation;
- sentence structure is unnatural in the target language;
- tone changes materially between languages;
- evidence or certainty changes;
- the CTA becomes more commercial than the canonical brief;
- idioms or expressions sound forced;
- English becomes generic corporate copy;
- Catalan becomes artificially informal;
- Spanish becomes over-marketed or bureaucratic.

## Storage model
Each public piece has one canonical editorial brief and one or more native language variants. Variants may differ in rhythm, sentence order and examples where necessary for naturalness, but they must share the same evidence set and core thesis.