interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-secondary mb-2">{title}</p>
            <h5 className="fw-bold mb-0">{value}</h5>
            <small className="text-secondary">{description}</small>
          </div>

          <div className={`stat-icon ${color}`}>
            <i className={`bi ${icon} fs-3`}></i>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
