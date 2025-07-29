"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/candidate-card";
import { useAuth } from "@/contexts/auth-context";
import { Search, Users, Filter, Mail, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Candidate, CandidateSearchResponse } from "@/types/candidate";

function CandidatesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/search-candidates?${params}`);
      if (!res.ok) throw new Error("Failed to fetch candidates");

      const data: CandidateSearchResponse = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
        setTotalPages(data.pagination.totalPages);
        setTotalCandidates(data.pagination.total);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Unable to load candidates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/candidates?${params.toString()}`);
  };

  const handleBulkContact = () => {
    if (selectedCandidates.length === 0) {
      toast({ title: "No candidates selected", variant: "destructive" });
      return;
    }
    const emails = candidates
      .filter((c) => selectedCandidates.includes(c.user_id))
      .map((c) => c.email)
      .join(";");
    window.open(`mailto:?bcc=${emails}&subject=Job Opportunity`, "_blank");
    toast({ title: "Opened email client", description: `To ${selectedCandidates.length} candidates` });
  };

  const toggleSelection = (id: number) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const allSkills = [...new Set(candidates.flatMap((c) => c.skills))].slice(0, 20);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Candidate Search</h1>
            <p className="text-muted-foreground">Find candidates by skills, experience, and more</p>
          </div>
        </div>
        {selectedCandidates.length > 0 && (
          <Button onClick={handleBulkContact}>
            <Mail className="h-4 w-4 mr-2" /> Contact Selected ({selectedCandidates.length})
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Search Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search skills, name, email, job title..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => handleSearch("")}> <Filter className="h-4 w-4 mr-2" /> Clear </Button>
          </div>

          {allSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Popular Skills:</p>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="cursor-pointer" onClick={() => handleSearch(skill)}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">
            {totalCandidates} candidate{totalCandidates !== 1 ? "s" : ""}
          </span>
          {searchTerm && <Badge variant="secondary">for "{searchTerm}"</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse"><CardContent className="p-6">Loading...</CardContent></Card>
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((c) => (
              <div key={c.user_id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-4 right-4 z-10 h-4 w-4"
                  checked={selectedCandidates.includes(c.user_id)}
                  onChange={() => toggleSelection(c.user_id)}
                />
                <CandidateCard
                  candidate={c}
                  searchTerm={searchTerm}
                  onContact={() => window.open(`mailto:${c.email}`)}
                  onViewResume={() => toast({ title: "Viewing Resume", description: `${c.name}` })}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="flex items-center px-4">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No candidates found" : "No candidates available"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? `No results for "${searchTerm}". Try another keyword.` : "No candidate resumes yet."}
            </p>
            {searchTerm && <Button variant="outline" onClick={() => handleSearch("")}>Clear Search</Button>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading search filters...</div>}>
      <CandidatesContent />
    </Suspense>
  );
}
