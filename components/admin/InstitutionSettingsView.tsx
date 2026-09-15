"use client";

import React, { useState } from "react";
import {
  Settings,
  School,
  Building2,
  Users,
  Target,
  Bell,
  Save,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstitutionSettingsView() {
  const [saved, setSaved] = useState(false);
  const [institutionName, setInstitutionName] = useState("National Institute of Technology");
  const [institutionCode, setInstitutionCode] = useState("NIT-26044");
  const [nirfRank, setNirfRank] = useState("Top 25");
  const [targetPlacementRate, setTargetPlacementRate] = useState(85);
  const [criticalGapThreshold, setCriticalGapThreshold] = useState(25);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-950/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Institution & Academic Settings
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Configure institutional profile, benchmarking thresholds, and automated alert preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Institutional Profile */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-950/60 pb-3">
            <School className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Institutional Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-foreground-muted block mb-1">Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 px-3 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-foreground-muted block mb-1">AICTE / AISHE Institute Code</label>
              <input
                type="text"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value)}
                className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 px-3 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-foreground-muted block mb-1">NIRF / Accreditation Status</label>
              <input
                type="text"
                value={nirfRank}
                onChange={(e) => setNirfRank(e.target.value)}
                className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 px-3 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Analytics & Placement Targets */}
        <div className="rounded-md border border-blue-950/60 bg-[#080E1C] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-950/60 pb-3">
            <Target className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Placement & Benchmark Targets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-foreground-muted block mb-1">Annual Placement Goal Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={targetPlacementRate}
                onChange={(e) => setTargetPlacementRate(Number(e.target.value))}
                className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 px-3 text-xs text-white focus:border-primary focus:outline-none"
              />
              <span className="text-[10px] text-foreground-muted mt-1 block">
                Triggers visual alerts if projected cohort placement falls below this goal.
              </span>
            </div>
            <div>
              <label className="text-foreground-muted block mb-1">Critical Skill Gap Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={criticalGapThreshold}
                onChange={(e) => setCriticalGapThreshold(Number(e.target.value))}
                className="w-full rounded-md border border-blue-950/60 bg-[#060A14] py-1.5 px-3 text-xs text-white focus:border-primary focus:outline-none"
              />
              <span className="text-[10px] text-foreground-muted mt-1 block">
                Skills with (Demand % - Supply %) &gt; this threshold will be classified as CRITICAL.
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Settings saved successfully!</span>
            </div>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
