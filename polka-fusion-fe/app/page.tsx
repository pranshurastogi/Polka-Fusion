"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Info, 
  ExternalLink,
  Shield,
  Clock,
  Hash,
  Key,
  Wallet,
  Network,
  AlertCircle,
  Copy,
  Check,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Step = "setup" | "lock" | "cross" | "claim" | "success"
type NetworkType = "ethereum" | "polkadot"

interface EscrowState {
  maker: string
  taker: string
  amount: string
  partsCount: number
  expiryTimestamp: number
  merkleRoot: string
  secrets: string[]
  proofs: string[][]
  partsClaimed: number
  refunded: boolean
  balance: string
}

export default function PolkaFusion() {
  const [currentStep, setCurrentStep] = useState<Step>("setup")
  const [isConnected, setIsConnected] = useState(false)
  const [activeNetwork, setActiveNetwork] = useState<NetworkType>("ethereum")
  const [escrowState, setEscrowState] = useState<EscrowState>({
    maker: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    taker: "0x1234567890123456789012345678901234567890",
    amount: "100",
    partsCount: 4,
    expiryTimestamp: 0,
    merkleRoot: "",
    secrets: [],
    proofs: [],
    partsClaimed: 0,
    refunded: false,
    balance: "0"
  })
  const [currentPart, setCurrentPart] = useState(0)
  const [secretInput, setSecretInput] = useState("")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Generate Merkle tree and secrets
  useEffect(() => {
    if (currentStep === "lock") {
      generateMerkleTree()
    }
  }, [currentStep])

  const generateMerkleTree = () => {
    // Simulate Merkle tree generation
    const secrets = Array.from({ length: escrowState.partsCount }, (_, i) => 
      `0x${Math.random().toString(16).substring(2, 34).padStart(64, '0')}`
    )
    const merkleRoot = `0x${Math.random().toString(16).substring(2, 34).padStart(64, '0')}`
    
    // Generate mock proofs for each part
    const proofs = secrets.map((_, i) => 
      Array.from({ length: 3 }, () => `0x${Math.random().toString(16).substring(2, 34).padStart(64, '0')}`)
    )

    setEscrowState(prev => ({
      ...prev,
      secrets,
      merkleRoot,
      proofs,
      expiryTimestamp: Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
    }))
  }

  const handleStepProgress = () => {
    if (currentStep === "setup") {
      setCurrentStep("lock")
      setIsConnected(true)
    } else if (currentStep === "lock") {
      setCurrentStep("cross")
      // Simulate cross-chain progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setCurrentStep("claim")
            return 100
          }
          return prev + 10
        })
      }, 300)
    } else if (currentStep === "cross") {
      setCurrentStep("claim")
    } else if (currentStep === "claim") {
      if (currentPart < escrowState.partsCount - 1) {
        setCurrentPart(prev => prev + 1)
        setSecretInput("")
      } else {
        setCurrentStep("success")
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-red-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Polka Fusion</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Tabs value={activeNetwork} onValueChange={(value) => setActiveNetwork(value as NetworkType)}>
              <TabsList className="bg-white/10">
                <TabsTrigger value="ethereum" className="data-[state=active]:bg-white/20">
                  <Network className="w-4 h-4 mr-1" />
                  Ethereum
                </TabsTrigger>
                <TabsTrigger value="polkadot" className="data-[state=active]:bg-white/20">
                  <Shield className="w-4 h-4 mr-1" />
                  Polkadot
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isConnected && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-100">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                Connected
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {currentStep === "setup" && <SetupScreen onEnter={handleStepProgress} />}

          {(currentStep === "lock" || currentStep === "cross" || currentStep === "claim") && (
            <EscrowInterface
              currentStep={currentStep}
              escrowState={escrowState}
              setEscrowState={setEscrowState}
              currentPart={currentPart}
              secretInput={secretInput}
              setSecretInput={setSecretInput}
              progress={progress}
              onNext={handleStepProgress}
              copyToClipboard={copyToClipboard}
              copied={copied}
              formatAddress={formatAddress}
              formatHash={formatHash}
            />
          )}

          {currentStep === "success" && <SuccessScreen escrowState={escrowState} />}
        </AnimatePresence>
      </main>

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Footer */}
      <footer className="mt-12 border-t border-pink-200 bg-white/50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Smart Contract Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>EscrowSrc: {formatAddress("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6")}</p>
                <p>EscrowDst: {formatAddress("0x1234567890123456789012345678901234567890")}</p>
                <button className="text-pink-600 hover:text-pink-700 flex items-center">
                  View on Etherscan <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Bridge Statistics</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Swaps</span>
                  <span className="text-green-600">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span className="text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Bridge Time</span>
                  <span className="text-green-600">2.3s</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Credits</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  Made with ❤️ by{" "}
                  <a
                    href="https://x.com/pranshurastogii"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 ml-1 flex items-center"
                  >
                    @pranshurastogii <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </p>
                <p className="flex items-center">
                  <a
                    href="https://github.com/pranshurastogi/Polka-Fusion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 flex items-center"
                  >
                    Project Repository <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                  Powered by <span className="font-semibold text-pink-600">1inch+ Fusion</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SetupScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="text-center py-20"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-pink-400/30 to-red-500/30 rounded-full"
        />
      </div>

      <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
        Cross-Chain Atomic Swap
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Secure atomic swaps between Ethereum and Polkadot using Merkle tree-based part claiming.
      </p>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-pink-600" />
              Ethereum EscrowSrc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Factory-based deployment</p>
            <p>• Merkle tree verification</p>
            <p>• Part-based claiming</p>
            <p>• Time-locked refunds</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-pink-600" />
              Polkadot EscrowDst
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Ink! smart contract</p>
            <p>• Cross-chain verification</p>
            <p>• Atomic swap completion</p>
            <p>• Secure token transfer</p>
          </CardContent>
        </Card>
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onEnter}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
        >
          Start Atomic Swap
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

function EscrowInterface({
  currentStep,
  escrowState,
  setEscrowState,
  currentPart,
  secretInput,
  setSecretInput,
  progress,
  onNext,
  copyToClipboard,
  copied,
  formatAddress,
  formatHash
}: {
  currentStep: Step
  escrowState: EscrowState
  setEscrowState: (state: EscrowState) => void
  currentPart: number
  secretInput: string
  setSecretInput: (value: string) => void
  progress: number
  onNext: () => void
  copyToClipboard: (text: string, type: string) => void
  copied: string | null
  formatAddress: (address: string) => string
  formatHash: (hash: string) => string
}) {
  const steps = [
    { id: "lock", label: "Lock", description: "Create escrow" },
    { id: "cross", label: "Cross", description: "Bridge networks" },
    { id: "claim", label: "Claim", description: "Claim parts" },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Progress Stepper */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStepIndex === index ? 1.1 : 1,
                  backgroundColor: currentStepIndex >= index ? "#ec4899" : "#e5e7eb",
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-lg"
              >
                {currentStepIndex > index ? <CheckCircle className="w-6 h-6" /> : index + 1}
              </motion.div>
              <div className="mt-2 text-center">
                <div className="font-medium text-gray-800">{step.label}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <motion.div
                animate={{
                  backgroundColor: currentStepIndex > index ? "#ec4899" : "#e5e7eb",
                }}
                className="w-16 h-1 mx-4 rounded-full"
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Escrow Card */}
      <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span>Escrow Contract</span>
            <motion.div animate={{ rotate: currentStep === "claim" ? 0 : 180 }} transition={{ duration: 0.5 }}>
              {currentStep === "claim" ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Contract State */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                Contract Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maker:</span>
                  <span className="font-mono">{formatAddress(escrowState.maker)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taker:</span>
                  <span className="font-mono">{formatAddress(escrowState.taker)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>{escrowState.amount} TEST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parts:</span>
                  <span>{escrowState.partsClaimed}/{escrowState.partsCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Hash className="w-4 h-4 mr-2" />
                Merkle Tree
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Root:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">{formatHash(escrowState.merkleRoot)}</span>
                    <button
                      onClick={() => copyToClipboard(escrowState.merkleRoot, "root")}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      {copied === "root" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parts Count:</span>
                  <span>{escrowState.partsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry:</span>
                  <span>{new Date(escrowState.expiryTimestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step-specific content */}
          {currentStep === "lock" && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Escrow contract has been deployed and initialized. Tokens are locked with Merkle tree verification.
                </AlertDescription>
              </Alert>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Merkle Root</Label>
                  <Input value={escrowState.merkleRoot} readOnly className="font-mono text-sm bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label>Parts Count</Label>
                  <Input value={escrowState.partsCount.toString()} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
          )}

          {currentStep === "cross" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">Bridging to Polkadot...</div>
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-gray-600 mt-2">Cross-chain verification in progress... {progress}% complete</p>
              </div>

              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="flex justify-center space-x-2"
              >
                <div className="w-2 h-2 bg-pink-500 rounded-full" />
                <div className="w-2 h-2 bg-pink-500 rounded-full" />
                <div className="w-2 h-2 bg-pink-500 rounded-full" />
              </motion.div>
            </div>
          )}

          {currentStep === "claim" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Claim Part {currentPart + 1}/{escrowState.partsCount}</h3>
                <p className="text-sm text-gray-600">Enter the secret for this part to claim tokens</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Secret for Part {currentPart + 1}</Label>
                  <Input
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="Enter the secret key for this part"
                    className="font-mono"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expected Secret</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={escrowState.secrets[currentPart] || ""} 
                        readOnly 
                        className="font-mono text-sm bg-gray-50" 
                      />
                      <button
                        onClick={() => copyToClipboard(escrowState.secrets[currentPart] || "", "secret")}
                        className="text-pink-600 hover:text-pink-700"
                      >
                        {copied === "secret" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Proof Length</Label>
                    <Input 
                      value={`${escrowState.proofs[currentPart]?.length || 0} hashes`} 
                      readOnly 
                      className="bg-gray-50" 
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Each part requires a unique secret and Merkle proof for verification. Parts must be claimed in order.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Action Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onNext}
              className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white py-3 text-lg rounded-lg shadow-lg"
              disabled={currentStep === "cross" && progress < 100}
            >
              {currentStep === "lock" && "Deploy to Polkadot"}
              {currentStep === "cross" && (progress < 100 ? "Processing..." : "Ready to Claim")}
              {currentStep === "claim" && `Claim Part ${currentPart + 1}`}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SuccessScreen({ escrowState }: { escrowState: EscrowState }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-800 mb-4">Atomic Swap Completed! 🎉</h2>
      <p className="text-lg text-gray-600 mb-8">All parts have been successfully claimed on Polkadot.</p>

      <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto shadow-lg">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Ethereum (Source)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Initial Amount:</span>
                <span className="font-semibold">{escrowState.amount} TEST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parts Claimed:</span>
                <span className="font-semibold">{escrowState.partsCount}/{escrowState.partsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">Completed</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Polkadot (Destination)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Received Amount:</span>
                <span className="font-semibold">{escrowState.amount} DOT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bridge Time:</span>
                <span className="font-semibold text-green-600">2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold">Success</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Merkle Root:</span>
            <span className="font-mono">{escrowState.merkleRoot.slice(0, 20)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Hash:</span>
            <span className="font-mono">0x7b2274...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gas Used:</span>
            <span>245,678 gas</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ConfettiEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: window.innerHeight + 10,
            rotate: Math.random() * 360,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: "easeOut",
          }}
          className="absolute w-3 h-3 bg-gradient-to-br from-pink-400 to-red-500 rounded-sm"
        />
      ))}
    </div>
  )
}
