"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Unlock, ArrowRight, CheckCircle, Sparkles, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

type Step = "gate" | "lock" | "cross" | "claim" | "success"

export default function PolkaFusion() {
  const [currentStep, setCurrentStep] = useState<Step>("gate")
  const [isConnected, setIsConnected] = useState(false)
  const [swapAmount, setSwapAmount] = useState("1.5")
  const [secret, setSecret] = useState("")
  const [hashlock, setHashlock] = useState("0x7b2274...")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const steps = [
    { id: "lock", label: "Lock", description: "Secure your assets" },
    { id: "cross", label: "Cross", description: "Bridge networks" },
    { id: "claim", label: "Claim", description: "Receive tokens" },
  ]

  const handleStepProgress = () => {
    if (currentStep === "gate") {
      setCurrentStep("lock")
      setIsConnected(true)
    } else if (currentStep === "lock") {
      setCurrentStep("cross")
      // Simulate progress
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
      setCurrentStep("success")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
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
            <div className="flex bg-white/10 rounded-lg p-1">
              <button className="px-3 py-1 rounded bg-white/20 text-sm font-medium">Ethereum</button>
              <button className="px-3 py-1 text-sm font-medium opacity-70">Polkadot</button>
            </div>

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
      <main className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {currentStep === "gate" && <BridgeGate onEnter={handleStepProgress} />}

          {(currentStep === "lock" || currentStep === "cross" || currentStep === "claim") && (
            <SwapInterface
              currentStep={currentStep}
              steps={steps}
              progress={progress}
              swapAmount={swapAmount}
              setSwapAmount={setSwapAmount}
              secret={secret}
              setSecret={setSecret}
              hashlock={hashlock}
              onNext={handleStepProgress}
            />
          )}

          {currentStep === "success" && <SuccessScreen />}
        </AnimatePresence>
      </main>

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Footer */}
      <footer className="mt-12 border-t border-pink-200 bg-white/50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Support</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Need help? Check our FAQ or contact support.</p>
                <button className="text-pink-600 hover:text-pink-700 flex items-center">
                  View Documentation <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Top Relayers</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>FastBridge</span>
                  <span className="text-green-600">2.3s avg</span>
                </div>
                <div className="flex justify-between">
                  <span>QuickRelay</span>
                  <span className="text-green-600">2.8s avg</span>
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

function BridgeGate({ onEnter }: { onEnter: () => void }) {
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
        Welcome to the Bridge Gate
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Seamlessly bridge your assets between Ethereum and Polkadot through our secure atomic swap protocol.
      </p>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onEnter}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
        >
          Enter the Fusion
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  )
}

function SwapInterface({
  currentStep,
  steps,
  progress,
  swapAmount,
  setSwapAmount,
  secret,
  setSecret,
  hashlock,
  onNext,
}: {
  currentStep: Step
  steps: Array<{ id: string; label: string; description: string }>
  progress: number
  swapAmount: string
  setSwapAmount: (value: string) => void
  secret: string
  setSecret: (value: string) => void
  hashlock: string
  onNext: () => void
}) {
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

      {/* Main Swap Card */}
      <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span>Cross-Chain Swap</span>
            <motion.div animate={{ rotate: currentStep === "claim" ? 0 : 180 }} transition={{ duration: 0.5 }}>
              {currentStep === "claim" ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Token Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From (Ethereum)</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ETH
                </div>
                <Input
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="border-0 bg-transparent text-lg font-semibold"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>To (Polkadot)</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  DOT
                </div>
                <div className="text-lg font-semibold text-gray-600">
                  {(Number.parseFloat(swapAmount) * 0.95).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Step-specific content */}
          {currentStep === "lock" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  Hashlock
                  <Info className="w-4 h-4 ml-1 text-gray-400" />
                </Label>
                <Input value={hashlock} readOnly className="font-mono text-sm bg-gray-50" />
              </div>
              <p className="text-sm text-gray-600">
                Your assets will be locked with this hashlock until the swap completes.
              </p>
            </div>
          )}

          {currentStep === "cross" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">Bridging Networks...</div>
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-gray-600 mt-2">Your assets are en route! {progress}% complete</p>
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
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter your secret to claim tokens"
                  className="font-mono"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Auto-claim available</span>
                <button className="text-pink-600 hover:text-pink-700">Use Auto-claim</button>
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
              {currentStep === "lock" && "Initiate Swap"}
              {currentStep === "cross" && (progress < 100 ? "Processing..." : "Ready to Claim")}
              {currentStep === "claim" && "Claim Tokens"}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SuccessScreen() {
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

      <h2 className="text-3xl font-bold text-gray-800 mb-4">Swap Completed Successfully! 🎉</h2>
      <p className="text-lg text-gray-600 mb-8">Your tokens have been successfully bridged to Polkadot.</p>

      <div className="bg-white/80 backdrop-blur rounded-xl p-6 max-w-md mx-auto shadow-lg">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Received:</span>
            <span className="font-semibold">1.425 DOT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Hash:</span>
            <span className="font-mono text-sm text-pink-600">0x7b2274...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bridge Time:</span>
            <span className="font-semibold text-green-600">2.3s</span>
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
