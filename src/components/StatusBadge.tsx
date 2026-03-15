interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'urgent';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels = {
    pending: 'Pendente',
    completed: 'Concluído',
    urgent: 'Urgente',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
