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
    value: "12",
    icon: FileText,
    description: "+2 from last month",
    color: "text-teal-600",
    bg: "bg-teal-50"
  },
  {
    title: "Average Score",
    value: "84%",
    icon: CheckCircle2,
    description: "Across all subjects",
    color: "text-gold-600",
    bg: "bg-gold-50"
  },
  {
    title: "Study Hours",
    value: "48.5",
    icon: Clock,
    description: "This week",
    color: "text-crimson-600",
    bg: "bg-crimson-50"
  },
  {
    title: "AI Questions",
    value: "124",
    icon: BrainCircuit,
    description: "Generated & solved",
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
          Track your progress and manage your upcoming examinations.
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
                <TrendingUp className="h-3 w-3 text-teal-500" />
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
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Mathematics Final Prep</p>
                    <p className="text-xs text-zinc-400">Solved 15 AI-generated questions</p>
                  </div>
                  <div className="text-sm font-medium text-teal-600">
                    2h ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-display font-bold text-teal-900">Next Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-gold-50 border border-gold-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <AlertCircle className="h-6 w-6 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-teal-900">Physics 101</p>
                  <p className="text-xs text-gold-700">Tomorrow at 10:00 AM</p>
                </div>
              </div>
              <Button className="w-full bg-white hover:bg-zinc-50 text-teal-900 border-none shadow-sm font-medium">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
