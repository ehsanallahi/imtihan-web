"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function ExportButton({ data, filename, headers }) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    try {
      setLoading(true);
      
      if (!data || data.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Create CSV content
      const csvHeader = headers.join(",") + "\n";
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header] === null || row[header] === undefined ? "" : row[header];
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(",");
      }).join("\n");

      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={loading}
      className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
      Export CSV
    </Button>
  );
}
