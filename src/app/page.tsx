import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { ConnectButton } from "@/components/web3/ConnectButton";
import { AccountCard } from "@/components/web3/AccountCard";
import { NetworkCard } from "@/components/web3/NetworkCard";
import { Web3Guard } from "@/components/web3/Web3Guard";
import { SignMessageCard } from "@/components/web3/SignMessageCard";
import { ContractReadCard } from "@/components/web3/ContractReadCard";
import { ContractWriteCard } from "@/components/web3/ContractWriteCard";

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
            <ContractWriteCard />
          </div>
        </Web3Guard>

        <Card title="Vibe Prompt（給 AI）">
          <p className="text-sm text-black/70">
            Implement ContractWriteCard using useWriteContract to call ERC20
            transfer(to, amount). Provide to + amount inputs with basic
            validation. Show tx hash after submission and map common errors
            (user rejected) to friendly UI. Use Web3Guard. Do not implement
            confirmation lifecycle yet.
          </p>
        </Card>
      </div>
    </Container>
  );
}
