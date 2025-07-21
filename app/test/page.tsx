"use client";

import jobs from "./jobs.json";

interface Job {
  role: string;
  organization: string;
  period: string;
  description: string;
}

function parsePeriodToMonths(period: string): number {
  const match = period.match(/(\w+ \d{4})\s+–\s+(\w+ \d{4})/);
  if (!match) return 0;

  const [_, startStr, endStr] = match;
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();

  return yearDiff * 12 + monthDiff + 1; // +1 to include the starting month
}

function formatTotalMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years} year${years !== 1 ? "s" : ""}${months > 0 ? ` ${months} month${months !== 1 ? "s" : ""}` : ""}`;
}

export default function JobsPage() {
  const totalMonths = jobs.reduce((sum, job) => sum + parsePeriodToMonths(job.period), 0);
  const totalExperience = formatTotalMonths(totalMonths);
  const devMonths = Math.max(0, totalMonths - 5);
  const devExperience = formatTotalMonths(devMonths);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">My Work Experience</h1>
      <div className="text-gray-700 mb-6 space-y-1">
        <p>Total Experience: <strong>{totalExperience}</strong></p>
        <p>Total Dev Experience: <strong>{devExperience}</strong></p>
      </div>
      <div className="space-y-6">
        {jobs.map((job, idx) => (
          <div key={idx} className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold">
              {job.role} @ {job.organization}
            </h3>
            <p className="text-sm text-gray-600">{job.period}</p>
            <p className="mt-2 text-sm">{job.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
