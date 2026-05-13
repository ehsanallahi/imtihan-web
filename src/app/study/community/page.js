import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCommunityDoubts } from "@/actions/p2pActions";
import CommunityDoubts from "@/components/study/community/CommunityDoubts";

export const metadata = {
  title: "Study Community | Imtihan",
};

export default async function CommunityPage(props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const subjectId = searchParams?.subjectId;
  const initialDoubts = await getCommunityDoubts(subjectId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <CommunityDoubts initialDoubts={initialDoubts} />
    </div>
  );
}
