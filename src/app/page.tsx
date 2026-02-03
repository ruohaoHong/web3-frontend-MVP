import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { ConnectButton } from "@/components/web3/ConnectButton";
import { AccountCard } from "@/components/web3/AccountCard";
import { NetworkCard } from "@/components/web3/NetworkCard";
import { Web3Guard } from "@/components/web3/Web3Guard";
import { SignMessageCard } from "@/components/web3/SignMessageCard";

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

        <NetworkCard />

        <Web3Guard>
          <div className="space-y-6">
            <AccountCard />
            <SignMessageCard />
          </div>
        </Web3Guard>

        <Card title="Vibe Prompt（給 AI）">
          <p className="text-sm text-black/70">
            Implement SignMessageCard with useSignMessage. Provide input + Sign
            button. Disable when disconnected or on unsupported chain (use
            Web3Guard). Display signature on success, user-friendly error on
            reject. No unhandled console errors.
          </p>
        </Card>
      </div>
    </Container>
  );
}
