import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { ConnectButton } from "@/components/web3/ConnectButton";
import { AccountCard } from "@/components/web3/AccountCard";
import { NetworkCard } from "@/components/web3/NetworkCard";
import { Web3Guard } from "@/components/web3/Web3Guard";
import { SignMessageCard } from "@/components/web3/SignMessageCard";
import { ContractReadCard } from "@/components/web3/ContractReadCard";

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
            <ContractReadCard />
          </div>
        </Web3Guard>

        <Card title="Vibe Prompt（給 AI）">
          <p className="text-sm text-black/70">
            Add ERC20 ABI and implement ContractReadCard using useReadContract to
            read balanceOf for the connected address. Provide token address input
            with basic validation. Display balance (raw acceptable, optionally
            format using decimals). Guard via Web3Guard. Handle errors gracefully.
          </p>
        </Card>
      </div>
    </Container>
  );
}
