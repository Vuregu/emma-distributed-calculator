import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Emma's Distributed Calculator App
        </h1>
        <p className="text-lg text-muted-foreground">
          Empowering your workforce, one task at a time.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="default" size="lg">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Register
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
