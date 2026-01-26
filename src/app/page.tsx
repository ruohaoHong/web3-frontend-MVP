import { Container } from "@/components/layout/Container";

export default function HomePage() {
  return (
    <Container>
      <h1 className="text-2xl font-semibold text-red-500">xxxxxxxxxxx</h1>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Web3 Frontend MVP
        </h1>
        <p className="text-black/70">
          Next.js + TypeScript + Tailwind scaffold is ready. Next commits will add
          RainbowKit, wallet info, sign message, contract read/write, and tx UI.
        </p>

        <div className="rounded-lg border border-black/10 p-4 text-sm">
          <p className="font-medium">Vibe Prompt（給 AI）</p>
          <p className="mt-2 text-black/70">
            Create a Next.js (App Router) + TypeScript + Tailwind project. Add a
            simple layout with Header and Container. Keep code minimal and clean.
          </p>
        </div>
      </div>
    </Container>
  );
}
