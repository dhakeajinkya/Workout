import { Chart as ChartJS, LinearScale, PointElement, LineElement, TimeScale, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { useLifts, get1RMProgression, getLatestBodyweight, getBodyweightProgression } from '../lib/useLifts';
import { calcLiftScore, calcOverallScore, calculateDOTS } from '../lib/scoring';

ChartJS.register(LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

const SCORED_LIFTS = ['squat', 'bench', 'deadlift', 'ohp'];

export default function Overall() {
  const { entries, loading } = useLifts();
  if (loading) return <p className="text-text-muted">Loading...</p>;

  const allDates = new Set<string>();
  for (const lift of SCORED_LIFTS) for (const p of get1RMProgression(entries, lift)) allDates.add(p.date);
  const sortedDates = Array.from(allDates).sort();
  if (sortedDates.length === 0) return <p>No progression data yet.</p>;

  const bwByDate = new Map<string, number>();
  for (const bp of getBodyweightProgression(entries)) bwByDate.set(bp.date, bp.bodyweight);

  const runningBest: Record<string, number> = {};
  const ssScoreData: { x: string; y: number }[] = [];
  const dotsData: { x: string; y: number }[] = [];
  let lastBw = getLatestBodyweight(entries);

  for (const date of sortedDates) {
    for (const lift of SCORED_LIFTS) {
      const dayEntry = get1RMProgression(entries, lift).find((p) => p.date === date);
      if (dayEntry && (!runningBest[lift] || dayEntry.estimated1RM > runningBest[lift])) runningBest[lift] = dayEntry.estimated1RM;
    }
    const bw = bwByDate.get(date) || lastBw;
    lastBw = bw;
    const liftScores = SCORED_LIFTS.filter((lift) => runningBest[lift]).map((lift) => ({ lift, ...calcLiftScore(lift, runningBest[lift], bw) }));
    if (liftScores.length > 0) ssScoreData.push({ x: date, y: calcOverallScore(liftScores).score });
    const total = SCORED_LIFTS.reduce((sum, lift) => sum + (runningBest[lift] || 0), 0);
    if (total > 0) dotsData.push({ x: date, y: calculateDOTS(bw, total) });
  }

  const latestSS = ssScoreData.length > 0 ? ssScoreData[ssScoreData.length - 1].y : 0;
  const latestDOTS = dotsData.length > 0 ? dotsData[dotsData.length - 1].y : 0;
  const total = Math.round(SCORED_LIFTS.reduce((sum, lift) => sum + (runningBest[lift] || 0), 0) * 10) / 10;

  return (
    <div>
      <h2>Overall Progress</h2>
      <p className="text-sm opacity-60 mb-4">Your composite strength trajectory over time. SS Score normalizes for bodyweight and averages across lifts. DOTS is the official IPF coefficient used in competition.</p>
      <div className="flex gap-3 mb-6 flex-wrap justify-center">
        <div className="stat-card"><div className="label">SS Score</div><div className="value">{latestSS}</div><div className="sub">Bodyweight-normalized strength</div></div>
        <div className="stat-card"><div className="label">DOTS</div><div className="value">{latestDOTS}</div><div className="sub">IPF powerlifting coefficient</div></div>
        <div className="stat-card"><div className="label">Total</div><div className="value">{total}kg</div><div className="sub">SBD + OHP estimated 1RMs</div></div>
      </div>

      <h4>Strength Score Over Time</h4>
      <p className="text-xs opacity-60 mb-2">Tracks your best-ever 1RMs across SBD + OHP, normalized for bodyweight changes.</p>
      <Line data={{ datasets: [{ label: 'SS Score', data: ssScoreData, borderColor: '#7986cb', backgroundColor: 'rgba(121,134,203,0.1)', fill: true, tension: 0.3, pointRadius: 4 }] }}
        options={{ responsive: true, plugins: { legend: { display: false } }, scales: {
          x: { type: 'time', time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' } },
          y: { title: { display: true, text: 'Strength Score' }, beginAtZero: false },
        } }} />

      <h4 className="mt-8">DOTS Score Over Time</h4>
      <p className="text-xs opacity-60 mb-2">Official IPF formula: higher = stronger relative to bodyweight. Competitive lifters typically score 300-500+.</p>
      <Line data={{ datasets: [{ label: 'DOTS', data: dotsData, borderColor: '#81c784', backgroundColor: 'rgba(129,199,132,0.1)', fill: true, tension: 0.3, pointRadius: 4 }] }}
        options={{ responsive: true, plugins: { legend: { display: false } }, scales: {
          x: { type: 'time', time: { unit: 'day', tooltipFormat: 'yyyy-MM-dd' } },
          y: { title: { display: true, text: 'DOTS Score' }, beginAtZero: false },
        } }} />
    </div>
  );
}
