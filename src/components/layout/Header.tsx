import Link from "next/link";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="border-b border-black/10">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            Web3 Frontend MVP
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link href="/vibe" className="text-black/70 hover:text-black">
              /vibe
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
