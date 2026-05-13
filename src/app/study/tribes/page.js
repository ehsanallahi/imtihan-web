import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTribeDetails, getAllTribes } from "@/actions/tribeActions";
import TribeDashboard from "@/components/study/tribes/TribeDashboard";

export const metadata = {
  title: "Study Tribes | Imtihan",
};

export default async function TribesPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const [tribe, allTribes] = await Promise.all([
    getTribeDetails(),
    getAllTribes()
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <TribeDashboard tribe={tribe} allTribes={allTribes} />
    </div>
  );
}
