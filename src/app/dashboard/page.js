import { auth } from "@/auth";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Exams",
    value: "0",
    icon: FileText,
    description: "Start your first exam",
    color: "text-teal-600",
    bg: "bg-teal-50"
  },
  {
    title: "Average Score",
    value: "0%",
    icon: CheckCircle2,
    description: "No data yet",
    color: "text-gold-600",
    bg: "bg-gold-50"
  },
  {
    title: "Study Hours",
    value: "0.0",
    icon: Clock,
    description: "Keep going",
    color: "text-crimson-600",
    bg: "bg-crimson-50"
  },
  {
    title: "AI Questions",
    value: "0",
    icon: BrainCircuit,
    description: "Generate now",
    color: "text-teal-600",
    bg: "bg-teal-50"
  }
];

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight text-teal-900 sm:text-4xl">
          Dashboard Overview
        </h1>
        <p className="text-zinc-500">
          Welcome, {session?.user?.name || "Student"}. Track your progress and manage your exams.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-display text-teal-900">{stat.value}</div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-display font-bold text-teal-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-xl mt-2">
            <div className="text-center space-y-2">
              <p className="text-zinc-400 text-sm font-medium">No recent activity found.</p>
              <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                Upload Syllabus
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-display font-bold text-teal-900">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-teal-600 text-white space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-bold">Upload Your First PDF</p>
                <p className="text-xs text-teal-100">Upload your syllabus or lecture notes to generate AI questions.</p>
              </div>
              <Button className="w-full bg-white hover:bg-zinc-50 text-teal-700 border-none shadow-sm font-bold">
                Upload Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
