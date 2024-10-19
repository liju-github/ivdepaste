import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import Link from "next/link";


export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to PasteBin</h1>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/paste/new" legacyBehavior>Create New Paste</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/paste/my" legacyBehavior>My Pastes</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
