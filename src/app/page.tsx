import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { ConnectButton } from "@/components/web3/ConnectButton";

export default function HomePage() {
  return (
    <Container>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Web3 Frontend MVP
        </h1>

        <Card title="Wallet">
          <ConnectButton />
        </Card>

        <Card title="Vibe Prompt（給 AI）">
          <p className="text-sm text-black/70">
            Add a ConnectButton component using RainbowKit. Place it on the home
            page inside a Card.
          </p>
        </Card>
      </div>
    </Container>
  );
}
