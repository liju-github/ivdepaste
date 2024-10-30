'use client';

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { applicationName } from "@/types";
import Link from "next/link";


export default function Home() {

  return (
    <main className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to {applicationName}</h1>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/paste/new">Create a New Paste</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/paste/my">View My Pastes</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
