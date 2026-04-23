"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export function DashboardUploadSyllabus({ isCmsUser }) {
  if (isCmsUser) {
    return (
      <Button asChild variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
        <Link href="/dashboard/content">Upload Syllabus</Link>
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="border-teal-200 text-teal-700 hover:bg-teal-50"
      onClick={() => toast.info("Personal syllabus uploads are coming soon for students!")}
    >
      Upload Syllabus
    </Button>
  );
}

export function DashboardUploadNow({ isCmsUser }) {
  if (isCmsUser) {
    return (
      <Button asChild className="w-full bg-white hover:bg-zinc-50 text-teal-700 border-none shadow-sm font-bold">
        <Link href="/dashboard/content">Upload Now</Link>
      </Button>
    );
  }

  return (
    <Button 
      className="w-full bg-white hover:bg-zinc-50 text-teal-700 border-none shadow-sm font-bold"
      onClick={() => toast.info("PDF uploads for students are coming soon!")}
    >
      Upload Now
    </Button>
  );
}
