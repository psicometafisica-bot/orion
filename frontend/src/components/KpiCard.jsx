function KpiCard({ title, value, unit }) {
  return (
    <div className="kpi-card">
      <span className="kpi-title">{title}</span>
      <div>
        <span className="kpi-value">{value}</span>
        <span className="kpi-unit">{unit}</span>
      </div>
    </div>
  );
}
export default KpiCard;