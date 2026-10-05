# SC-Analytics V1 evaluation prompts

Use these prompts when testing the personal plugin in a new ChatGPT Work conversation.

## Editorial — should activate editorial-operator

- Revisa P008 y dime si el copy encaja con el visual actual.
- Cambia el segundo párrafo de P008 sin tocar el visual.
- Audita P001–P015 y detecta temas, hooks o ángulos demasiado repetidos.
- Revisa las publicaciones actuales contra el posicionamiento vigente de la web.
- Comprueba coherencia entre castellano, catalán e inglés en los artículos multilingües.

Expected behavior:
- retrieve persisted state instead of relying on chat history;
- preserve stable P00X IDs;
- use Figma as source of truth for manual visuals;
- never invent dates or publication state;
- persist only explicitly requested/approved edits.

## Performance — should activate performance-analyst

- Actualízame las métricas que podamos obtener ahora mismo.
- Analiza qué publicaciones han funcionado mejor este mes.
- Compara tráfico web y rendimiento editorial y dime qué merece cambiar.
- ¿Qué datos de LinkedIn tenemos y de qué fecha son?

Expected behavior:
- distinguish live data from imported/stale data;
- attribute metrics to content IDs only when mapping exists;
- avoid inventing LinkedIn data;
- do not create recurring automations unless requested.

## Research — should activate commercial-research

- Busca 20 empresas españolas que puedan necesitar forecasting, pero no guardes nada todavía.
- Actualiza el análisis de competencia de SC-Analytics.
- Busca tres cursos avanzados de AI agents que realmente encajen con mi nivel.
- Encuentra partners potenciales para complementar nuestra oferta de Data Engineering.

Expected behavior:
- use current public information;
- separate evidence from inference;
- avoid storing exploratory/discarded results by default;
- persist only results with future operational value or when explicitly requested.

## Should NOT create new CRM modules

- Búscame un curso de negociación.
- Compara tres herramientas para grabar reuniones.
- ¿Qué consultoras nuevas están hablando de agentic AI?

Expected behavior:
- answer in conversation;
- do not create a permanent CRM surface unless a repeated operational need is demonstrated.


## Opportunities — should activate opportunity-scout

- Búscame los mejores trabajos de Upwork que encajen conmigo hoy.
- Busca oportunidades fuera de Upwork donde estén buscando Data Science, AI, forecasting u optimización.
- Guarda la segunda oportunidad para seguirla.
- Añádeme una reunión mañana a las 16:00 para revisar esa oportunidad.

Expected behavior:
- use the Upwork connector for Upwork jobs and current web search outside Upwork;
- avoid duplicates against saved opportunities;
- do not persist rejected/exploratory results;
- save only after the user explicitly asks;
- use create_opportunity / create_meeting when persistence is requested;
- use LinkedIn only to enrich a known person when the connector has enough identifying information.
