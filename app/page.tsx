"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import { Button } from "./components/Button";
import { Icon } from "./components/Icon";
import MintNFT from "./components/MintNFT";
import { useAccount, useConnect } from "wagmi";
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';

type FrameData = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();

  const addFrame = useAddFrame();

  // Initialize frame connector
  const frameConnector = useMemo(() => farcasterFrame(), []);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Auto connect wallet on component mount
  useEffect(() => {
    const autoConnect = async () => {
      try {
        if (!isConnected) {
          console.log("Attempting to auto-connect wallet...");
          await connect({ connector: frameConnector });
        }
      } catch (error) {
        console.error("Auto-connect failed:", error);
      }
    };
    autoConnect();
  }, [isConnected, connect, frameConnector]);

  const handleAddFrame = useCallback(async () => {
    try {
      console.log("Adding frame...");
      const frameData: FrameData = {
        id: 'baseafricachristmasnft',
        title: 'Base Africa Christmas NFT',
        description: 'Mint your Base Africa Christmas NFT',
        image: process.env.NEXT_PUBLIC_ICON_URL || '',
      };
      const result = await addFrame();
      console.log("Frame added:", result);
      setFrameAdded(Boolean(result));
    } catch (error) {
      console.error("Failed to add frame:", error);
    }
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  const handleConnect = useCallback(async () => {
    try {
      console.log("Connecting wallet...");
      await connect({ connector: frameConnector });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }, [connect, frameConnector]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => connect({ connector: frameConnector })}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleConnect}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          <MintNFT />
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          Base Africa Christmas NFT
        </footer>
      </div>
    </div>
  );
}
