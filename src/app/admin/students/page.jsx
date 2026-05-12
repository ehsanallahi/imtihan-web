import { getAdminStudents } from "@/actions/adminActions";
import StudentManagementView from "@/components/admin/StudentManagementView";

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const { data: students, error } = await getAdminStudents();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 font-bold p-8 rounded-3xl">
        Error loading students: {error}
      </div>
    );
  }

  return <StudentManagementView initialStudents={students || []} />;
}
