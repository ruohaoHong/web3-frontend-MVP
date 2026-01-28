"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectButton() {
  return (
    <div className="flex justify-start">
      <RainbowConnectButton
        accountStatus="address"
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  );
}
