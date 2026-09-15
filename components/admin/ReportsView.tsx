"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  School,
  Sparkles,
  Layers,
  Printer,
  ShieldCheck,
} from "lucide-react";
import type { InstitutionalReportSpec } from "@/types";
import { Button } from "@/components/ui/button";

interface ReportsViewProps {
  reports: InstitutionalReportSpec[];
}

export function ReportsView({ reports }: ReportsViewProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("PDF");

  const handleDownload = (id: string, name: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      // Trigger a browser mock download or print
      const reportBlob = new Blob(
        [
          `SKILLEDGER INSTITUTIONAL AUDIT DOSSIER\n` +
          `Report: ${name}\n` +
          `Generated: ${new Date().toISOString()}\n` +
          `Status: AICTE & NBA Compliant\n` +
          `Format: ${selectedFormat}\n\n` +
          `Summary Data:\n` +
          `- Verified Student Assessments: 536\n` +
          `- Institutional Readiness Index: 68.4%\n` +
          `- Active Placements: 84%\n` +
          `- Curriculum Alignment: 88%\n`
        ],
        { type: "text/plain;charset=utf-8" }
      );
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${selectedFormat.toLowerCase() === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Regulatory Compliance
            </span>
            <span className="text-xs text-foreground-muted">NBA, NAAC & AICTE Mapped</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Institutional Audit & Accreditation Reports
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Instant verifiable reports formatted for NBA Criterion 2 & 4, NAAC accreditation, and annual placement audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-blue-950/60 bg-[#080E1C] p-0.5">
            {["PDF", "CSV", "EXCEL"].map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  selectedFormat === format
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-muted hover:text-white"
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NBA / NAAC Compliance Badge Card */}
      <div className="rounded-md border border-blue-900/40 bg-gradient-to-r from-[#0A1227] via-[#080E1C] to-[#0A1227] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              NBA SAR Criterion 2 & 4 Telemetry Certified
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Automated Course Outcome (CO) and Program Outcome (PO) mapping generated from actual verified student code assessments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            Audit Ready 2026
          </span>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col justify-between rounded-md border border-blue-950/60 bg-[#080E1C] p-5 shadow-xs transition-all hover:border-blue-900/60"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                  {report.category}
                </span>
                <span className="text-[11px] text-foreground-muted">
                  Updated: {report.lastGenerated}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3">
                {report.name}
              </h3>
              <p className="text-xs text-foreground-muted mt-1.5 leading-relaxed">
                {report.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-blue-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-300 font-medium">
                Format: <span className="text-white font-bold">{selectedFormat}</span>
              </span>

              <Button
                size="sm"
                onClick={() => handleDownload(report.id, report.name)}
                disabled={downloadingId === report.id}
                className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {downloadingId === report.id ? (
                  <span>Generating Dossier...</span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Report</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
