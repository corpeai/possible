import { Navbar } from '@/components/Navbar';
import { X402Payment } from '@/components/X402Payment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Shield, Zap } from 'lucide-react';

export default function X402Payments() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">
            x402 Payment Protocol
          </h1>
          <p className="text-slate-300 text-sm">
            Multi-facilitator payment system with on-chain verification
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-white text-lg">Secure Payments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                On-chain verification and settlement through trusted facilitators
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-white text-lg">Fast Settlement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Instant payment verification and automated settlement process
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-white text-lg">Multi-Facilitator</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-300">
                Support for multiple payment facilitators including PayAI
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Payment Interface */}
        <X402Payment />

        {/* Protocol Information */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">About x402 Protocol</CardTitle>
            <CardDescription className="text-slate-300">
              Understanding the HTTP 402 Payment Required protocol
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3">
            <p>
              The x402 protocol extends HTTP 402 "Payment Required" status code to enable seamless 
              payment integration for web services and APIs. It provides a standardized way to request, 
              verify, and settle payments on the Solana blockchain.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Solana Pay URL generation for payment requests</li>
                <li>Multi-facilitator support for payment processing</li>
                <li>On-chain verification of payment transactions</li>
                <li>Automated settlement through facilitator APIs</li>
                <li>Support for custom memos and labels</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Payment Flow:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Create payment request with amount and recipient</li>
                <li>Generate Solana Pay URL with facilitator information</li>
                <li>User scans QR code or clicks payment link</li>
                <li>Transaction is broadcast to Solana network</li>
                <li>Facilitator verifies transaction on-chain</li>
                <li>Payment is settled and confirmed</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
