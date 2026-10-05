"use client";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { tr } from "@/lib/commercial-content";
const history = [84, 88, 93, 90, 98, 104, 101, 110, 116, 114, 121, 125];
const actual = history.slice(6);
const baseline = actual.map(
  (_, i) =>
    Math.round(
      (100 * history.slice(i + 3, i + 6).reduce((a, b) => a + b, 0)) / 3,
    ) / 100,
);
const points = (values: number[]) =>
  values.map((n, i) => `${65 + i * 108},${210 - (n - 85) * 3}`).join(" ");
export default function ForecastExample() {
  const { lang } = useSiteLanguage();
  return (
    <figure className="mt-6 border border-[#C6CFD6] bg-white p-5">
      <figcaption className="text-base font-semibold">
        {
          tr(
            "Ejemplo sintético: demanda y previsión base",
            "Exemple sintètic: demanda i previsió base",
            "Synthetic example: demand and baseline forecast",
          )[lang]
        }
      </figcaption>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {
          tr(
            "Seis predicciones de un paso. Cada previsión usa solo las tres observaciones anteriores. La comparación reproduce el backtest público; no mide los cuatro horizontes documentados.",
            "Sis prediccions d’un pas. Cada previsió usa només les tres observacions anteriors. La comparació reprodueix el backtest públic; no mesura els quatre horitzons documentats.",
            "Six one-step predictions. Each forecast uses only the preceding three observations. This reproduces the public backtest; it does not evaluate the four documented horizons.",
          )[lang]
        }
      </p>
      <svg
        viewBox="0 0 680 260"
        role="img"
        aria-label={
          tr(
            "Demanda sintética entre 101 y 125 unidades, comparada con media móvil de tres observaciones.",
            "Demanda sintètica entre 101 i 125 unitats, comparada amb mitjana mòbil de tres observacions.",
            "Synthetic demand from 101 to 125 units compared with a three-observation baseline forecast.",
          )[lang]
        }
        className="mt-4 w-full"
      >
        {[90, 100, 110, 120, 130].map((n) => (
          <g key={n}>
            <line
              x1="48"
              x2="640"
              y1={210 - (n - 85) * 3}
              y2={210 - (n - 85) * 3}
              stroke="#D8DDE3"
            />
            <text x="15" y={215 - (n - 85) * 3} fontSize="12" fill="#496C8A">
              {n}
            </text>
          </g>
        ))}
        <polyline
          points={points(actual)}
          fill="none"
          stroke="#0D1B2A"
          strokeWidth="3"
        />
        <polyline
          points={points(baseline)}
          fill="none"
          stroke="#5558C9"
          strokeDasharray="6 4"
          strokeWidth="3"
        />
        {actual.map((n, i) => (
          <g key={i}>
            <circle
              cx={65 + i * 108}
              cy={210 - (n - 85) * 3}
              r="4"
              fill="#0D1B2A"
            />
            <text
              x={65 + i * 108}
              y="238"
              textAnchor="middle"
              fontSize="12"
              fill="#496C8A"
            >
              {i + 7}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-sm">
        {
          tr(
            "Línea continua: demanda · Discontinua: previsión base (media móvil de 3)",
            "Línia contínua: demanda · Discontínua: previsió base (mitjana mòbil de 3)",
            "Solid: demand · Dashed: baseline forecast (moving average of 3)",
          )[lang]
        }
      </p>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold">
          {
            tr(
              "Ver datos y fuente",
              "Veure dades i font",
              "View data and source",
            )[lang]
          }
        </summary>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>{tr("Observación", "Observació", "Observation")[lang]}</th>
                <th>{tr("Demanda", "Demanda", "Demand")[lang]}</th>
                <th>
                  {tr("Media móvil", "Mitjana mòbil", "Moving average")[lang]}
                </th>
              </tr>
            </thead>
            <tbody>
              {actual.map((n, i) => (
                <tr key={i}>
                  <td>{i + 7}</td>
                  <td>{n}</td>
                  <td>{baseline[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <a
          className="mt-3 inline-block underline"
          target="_blank"
          rel="noreferrer"
          href="https://github.com/sastree14/Portfolio_SC_Analytics/blob/0d1c58a86d86fc26df7609f9ae2dfb3be036c6b6/projects/sc-12-multi-horizon-demand-forecasting/technical/run_project.py"
        >
          technical/run_project.py ↗
        </a>
      </details>
    </figure>
  );
}
