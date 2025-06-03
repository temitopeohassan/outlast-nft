'use client'

import React from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from './Button'
import { Card } from './Card'
import { Icon } from './Icon'

const WHITELIST_ADDRESS = '0x589AB24Cd45cBE5F6Eb4ff93bD87f1c9Fbb0dE27'
const WHITELIST_ABI = [
  {
    name: 'addAddressToWhitelist',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'whitelistedAddresses',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  }
] as const

export default function WhitelistForm() {
  const { address } = useAccount()
  const [error, setError] = useState<string>('')

  const { writeContract, data: hash } = useWriteContract()

  const { data: isWhitelisted } = useReadContract({
    address: WHITELIST_ADDRESS,
    abi: WHITELIST_ABI,
    functionName: 'whitelistedAddresses',
    args: address ? [address] : undefined,
  })

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    if (isWhitelisted) {
      setError('Address is already whitelisted')
      return
    }

    try {
      writeContract({
        address: WHITELIST_ADDRESS,
        abi: WHITELIST_ABI,
        functionName: 'addAddressToWhitelist',
      })
    } catch (err) {
      setError('Failed to add address to whitelist')
      console.error(err)
    }
  }

  return (
    <Card className="w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--app-foreground)]">
          {isWhitelisted 
            ? 'Your wallet is already whitelisted!'
            : 'Click below to add your connected wallet to the whitelist'
          }
        </p>

        {error && (
          <p className="text-sm text-[var(--ock-text-error)]">
            {error}
          </p>
        )}

        {isSuccess && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--ock-text-success)]">
              Successfully added to whitelist!
            </p>
            <Link 
              href="/"
              className="block w-full"
            >
              <Button 
                variant="primary"
                size="lg"
                className="w-full"
                icon={<Icon name="arrow-right" size="sm" />}
              >
                Mint NFT
              </Button>
            </Link>
          </div>
        )}

        <Button 
          type="submit" 
          variant={isWhitelisted ? "secondary" : "primary"}
          size="lg"
          disabled={!address || isLoading || isWhitelisted}
          className="w-full"
          icon={isWhitelisted ? <Icon name="check" size="sm" /> : undefined}
        >
          {isLoading 
            ? 'Adding...' 
            : isWhitelisted 
              ? 'Wallet Whitelisted' 
              : 'Add to Whitelist'
          }
        </Button>
      </form>
    </Card>
  )
}

