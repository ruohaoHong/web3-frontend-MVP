import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { ConnectButton } from "@/components/web3/ConnectButton";
import { AccountCard } from "@/components/web3/AccountCard";
import { NetworkCard } from "@/components/web3/NetworkCard";
import { Web3Guard } from "@/components/web3/Web3Guard";

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
          <AccountCard />
        </Web3Guard>

        <Card title="Vibe Prompt（給 AI）">
          <p className="text-sm text-black/70">
            Implement NetworkCard with useSwitchChain for post-connection
            network handling. Show current chain name + chainId. Support
            switching between Sepolia and Linea Sepolia. If on unsupported
            chain, show Wrong network and gate the Web3 section.
          </p>
        </Card>
      </div>
    </Container>
  );
}
