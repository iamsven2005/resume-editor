"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/candidate-card";
import { useAuth } from "@/contexts/auth-context";
import { Search, Users, Filter, Mail, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate, CandidateSearchResponse } from "@/types/candidate";

import dynamic from "next/dynamic";

const CandidatesContent = dynamic(() => import("./candidates-content"), {
  ssr: false,
  loading: () => <div className="p-6 text-center">Loading search filters...</div>,
});

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading search filters...</div>}>
      <CandidatesContent />
    </Suspense>
  );
}
