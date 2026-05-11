import { getWaitlist } from "@/actions/waitlist";
import WaitlistManagementView from "@/components/admin/WaitlistManagementView";

export const dynamic = 'force-dynamic';

export default async function AdminWaitlistPage() {
  const { data: entries, error } = await getWaitlist();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading waitlist: {error}
      </div>
    );
  }

  return <WaitlistManagementView entries={entries || []} />;
}
