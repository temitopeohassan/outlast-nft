'use client'

import React from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './Button'
import { Card } from './Card'
import { Icon } from './Icon'
import { sdk } from '@farcaster/frame-sdk'


const NFT_ADDRESS = '0x18be51d51f7dcC79fE037817b4bfb5E9cE09f784'
const WHITELIST_ADDRESS = '0x589AB24Cd45cBE5F6Eb4ff93bD87f1c9Fbb0dE27'
const NFT_IMAGE_URL = 'https://puredelightfoods.com/images/nftdesign.png'

const WHITELIST_ABI = [{
  name: 'whitelistedAddresses',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: '', type: 'address' }],
  outputs: [{ name: '', type: 'bool' }],
}] as const

const NFT_ABI = [{
  name: 'mint',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [],
  outputs: [],
}, {
  name: 'balanceOf',
  type: 'function',
  stateMutability: 'view',
  inputs: [{ name: 'owner', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}, {
  name: 'tokenOfOwnerByIndex',
  type: 'function',
  stateMutability: 'view',
  inputs: [
    { name: 'owner', type: 'address' },
    { name: 'index', type: 'uint256' }
  ],
  outputs: [{ name: '', type: 'uint256' }],
}] as const

export default function MintForm() {
  const { address } = useAccount()
  const [error, setError] = useState<string>('')
  const [tokenId, setTokenId] = useState<number | null>(null)
  const publicClient = usePublicClient()

  const { writeContract, data: hash } = useWriteContract()
  
  const { data: isWhitelisted } = useReadContract({
    address: WHITELIST_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'whitelistedAddresses',
    args: address ? [address] : undefined,
  })

  const { data: nftBalance } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const hasNFT = nftBalance ? Number(nftBalance) > 0 : false

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    if (!isWhitelisted) {
      setError('Your address is not whitelisted')
      return
    }

    if (hasNFT) {
      setError('You have already minted an NFT')
      return
    }

    try {
      writeContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
      })
    } catch (err) {
      setError('Failed to mint NFT')
      console.error(err)
    }
  }

  useEffect(() => {
    if ((isSuccess || hasNFT) && address && publicClient) {
      const fetchTokenId = async () => {
        try {
          const result = await publicClient.readContract({
            address: NFT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(0)],
          })
          setTokenId(Number(result))
        } catch (error) {
          console.error('Error fetching token ID:', error)
        }
      }
      fetchTokenId()
    }
  }, [isSuccess, hasNFT, address, publicClient])

  const handleShareOnFarcaster = async () => {
    await sdk.actions.composeCast({
      text: "Mint Your Outlast NFT",
      embeds: ["https://farcaster.xyz/~/mini-apps/launch?domain=outlast-nft.vercel.app"]
    });
  };


  return (
    <div className="flex flex-col gap-8 w-full max-w-[600px]">
      {/* NFT Image Card */}
      <Card className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] p-8">
        <div className="relative w-full aspect-square">
          <Image
            src="/image.png"
            width={113} 
            height={113}
            alt="Base Africa Christmas NFT"
            style={{ objectFit: 'contain' }}
            priority
            className="rounded-lg"
          />
        </div>
      </Card>

      {/* Mint Form Card */}
      <Card className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-[var(--app-foreground)]">
              Base Africa Christmas NFT
            </h2>
            
            <p className="text-sm text-[var(--app-foreground-muted)]">
              NFT for the Base Africa Community
            </p>
          </div>
          
          <Button 
            type="submit" 
            variant="primary"
            size="lg"
            disabled={!address || isLoading || !isWhitelisted || hasNFT}
            className="w-full"
          >
            {isLoading ? 'Minting...' : hasNFT ? 'Already Minted' : 'Mint NFT'}
          </Button>

          <div className="space-y-2 pt-2">
            {error && (
              <p className="text-sm text-[var(--ock-text-error)] text-center block">
                {error}
              </p>
            )}
            
            {(isSuccess || hasNFT) && (
              <div className="text-center space-y-2">
                {isSuccess && (
                  <p className="text-sm text-[var(--ock-text-success)] block">
                    Successfully minted your Base Africa Christmas NFT!
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  <Link 
                    href={`https://opensea.io/assets/base/${NFT_ADDRESS}/${tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] underline text-sm"
                  >
                    View on OpenSea
                  </Link>
                  <Button 
                    onClick={handleShareOnFarcaster}
                    variant="secondary"
                    size="sm"
                    icon={<Icon name="arrow-right" size="sm" />}
                  >
                    Share on Warpcast
                  </Button>
                </div>
              </div>
            )}
            
            {address && !isWhitelisted && (
              <p className="text-sm text-[var(--ock-text-error)] text-center block">
                Your wallet is not whitelisted. Please{' '}
                <Link 
                  href="/GetWhitelist"
                  className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] underline"
                >
                  get whitelisted
                </Link>
                {' '}first.
              </p>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}

