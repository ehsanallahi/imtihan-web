export default function RoleBadge({ role }) {
  const getRoleStyles = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/10";
      case "finance_manager":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10";
      case "content_editor":
        return "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10";
      case "moderator":
        return "bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/10";
      case "support_agent":
        return "bg-orange-50 text-orange-700 border-orange-100 ring-orange-500/10";
      case "marketer":
        return "bg-pink-50 text-pink-700 border-pink-100 ring-pink-500/10";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100 ring-slate-500/10";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ring-1 ring-inset ${getRoleStyles(role)}`}>
      {role.replace('_', ' ')}
    </span>
  );
}
