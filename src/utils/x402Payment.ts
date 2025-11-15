import { PublicKey, Transaction, SystemProgram, Connection } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import bs58 from 'bs58';

// x402 Protocol Types
export interface X402PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  outputSchema?: object | null;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: object | null;
}

export interface X402PaymentRequiredResponse {
  x402Version: number;
  accepts: X402PaymentRequirements[];
  error?: string;
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: any;
}

export interface X402VerificationResponse {
  isValid: boolean;
  invalidReason: string | null;
}

export interface X402SettlementResponse {
  success: boolean;
  error: string | null;
  txHash: string | null;
  networkId: string | null;
}

export interface FacilitatorInfo {
  name: string;
  url: string;
  networks: string[];
  description: string;
}

// Solana Pay Types
export interface PaymentRequest {
  recipient: string;
  amount: number;
  label?: string;
  message?: string;
  memo?: string;
  reference?: string;
}

export interface PaymentResponse {
  signature: string;
  timestamp: number;
  amount: number;
  recipient: string;
}

// Available Facilitators
export const FACILITATORS: Record<string, FacilitatorInfo> = {
  payai: {
    name: 'PayAI',
    url: 'https://facilitator.payai.network',
    networks: ['solana', 'solana-devnet', 'base', 'base-sepolia', 'avalanche', 'polygon'],
    description: 'Solana-first, multi-network facilitator with no API keys required',
  },
  coinbase: {
    name: 'Coinbase CDP',
    url: 'https://facilitator.cdp.coinbase.com',
    networks: ['base', 'base-sepolia', 'ethereum', 'polygon'],
    description: 'Production-ready facilitator by Coinbase with USDC support',
  },
  x402org: {
    name: 'x402.org',
    url: 'https://facilitator.x402.org',
    networks: ['solana', 'base', 'ethereum', 'polygon', 'arbitrum'],
    description: 'Community-run facilitator supporting multiple chains',
  },
};

export class X402PaymentProtocol {
  private static readonly PROTOCOL_VERSION = 1;
  private static readonly DEFAULT_TIMEOUT = 30;

  /**
   * Get supported facilitators for a specific network
   */
  static getSupportedFacilitators(network: string): FacilitatorInfo[] {
    return Object.values(FACILITATORS).filter(f => 
      f.networks.includes(network)
    );
  }

  /**
   * Create payment requirements for x402 protocol
   */
  static createPaymentRequirements(
    payTo: string,
    amount: number,
    network: string = 'solana',
    resource: string = '/',
    description: string = 'Payment required'
  ): X402PaymentRequiredResponse {
    const requirements: X402PaymentRequirements = {
      scheme: 'exact',
      network,
      maxAmountRequired: (amount * 1e9).toString(), // Convert SOL to lamports
      resource,
      description,
      mimeType: 'application/json',
      payTo,
      maxTimeoutSeconds: this.DEFAULT_TIMEOUT,
      asset: 'SOL', // Native SOL token
      extra: {
        decimals: 9,
        symbol: 'SOL',
      },
    };

    return {
      x402Version: this.PROTOCOL_VERSION,
      accepts: [requirements],
    };
  }

  /**
   * Create payment payload for Solana
   */
  static async createSolanaPaymentPayload(
    connection: Connection,
    payer: PublicKey,
    requirements: X402PaymentRequirements
  ): Promise<X402PaymentPayload> {
    const recipient = new PublicKey(requirements.payTo);
    const amount = parseInt(requirements.maxAmountRequired);

    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: recipient,
        lamports: amount,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer;

    // Serialize transaction (partially signed)
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      x402Version: this.PROTOCOL_VERSION,
      scheme: requirements.scheme,
      network: requirements.network,
      payload: {
        transaction: bs58.encode(serialized),
        payer: payer.toString(),
        amount: requirements.maxAmountRequired,
      },
    };
  }

  /**
   * Verify payment with facilitator
   */
  static async verifyPayment(
    facilitatorUrl: string,
    paymentHeader: string,
    requirements: X402PaymentRequirements
  ): Promise<X402VerificationResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(`${facilitatorUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          x402Version: this.PROTOCOL_VERSION,
          paymentHeader,
          paymentRequirements: requirements,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Verification failed (${response.status}): ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        isValid: false,
        invalidReason: error.name === 'AbortError' ? 'Request timeout' : (error.message || 'Verification request failed'),
      };
    }
  }

  /**
   * Settle payment with facilitator
   */
  static async settlePayment(
    facilitatorUrl: string,
    paymentHeader: string,
    requirements: X402PaymentRequirements
  ): Promise<X402SettlementResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(`${facilitatorUrl}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          x402Version: this.PROTOCOL_VERSION,
          paymentHeader,
          paymentRequirements: requirements,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Settlement failed (${response.status}): ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Payment settlement error:', error);
      return {
        success: false,
        error: error.name === 'AbortError' ? 'Request timeout' : (error.message || 'Settlement request failed'),
        txHash: null,
        networkId: null,
      };
    }
  }

  /**
   * Get supported payment methods from facilitator
   */
  static async getSupportedMethods(facilitatorUrl: string): Promise<Array<{scheme: string; network: string}>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${facilitatorUrl}/supported`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.kinds || [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout: facilitator not responding');
      } else {
        console.error('Failed to get supported methods:', error);
      }
      throw error;
    }
  }

  /**
   * Generate a Solana Pay URL for payment requests
   */
  static generatePaymentURL(request: PaymentRequest): string {
    const params = new URLSearchParams();
    
    if (request.amount) {
      params.append('amount', request.amount.toString());
    }
    
    if (request.label) {
      params.append('label', request.label);
    }
    
    if (request.message) {
      params.append('message', request.message);
    }
    
    if (request.memo) {
      params.append('memo', request.memo);
    }
    
    if (request.reference) {
      params.append('reference', request.reference);
    }

    return `solana:${request.recipient}?${params.toString()}`;
  }

  /**
   * Parse a Solana Pay URL into a payment request
   */
  static parsePaymentURL(url: string): PaymentRequest | null {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.protocol !== 'solana:') {
        return null;
      }

      const recipient = urlObj.pathname;
      const params = urlObj.searchParams;

      return {
        recipient,
        amount: params.get('amount') ? parseFloat(params.get('amount')!) : 0,
        label: params.get('label') || undefined,
        message: params.get('message') || undefined,
        memo: params.get('memo') || undefined,
        reference: params.get('reference') || undefined,
      };
    } catch (error) {
      console.error('Failed to parse payment URL:', error);
      return null;
    }
  }

  /**
   * Validate a Solana address
   */
  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format SOL amount with proper decimals
   */
  static formatAmount(amount: number, decimals: number = 4): string {
    return new BigNumber(amount).toFixed(decimals);
  }

  /**
   * Convert lamports to SOL
   */
  static lamportsToSOL(lamports: number | string): number {
    return new BigNumber(lamports).dividedBy(1e9).toNumber();
  }

  /**
   * Convert SOL to lamports
   */
  static solToLamports(sol: number): number {
    return new BigNumber(sol).multipliedBy(1e9).toNumber();
  }

  /**
   * Generate a QR code data URL for payment request
   */
  static generateQRData(request: PaymentRequest): string {
    return this.generatePaymentURL(request);
  }

  /**
   * Encode payment payload to base64 for X-PAYMENT header
   */
  static encodePaymentHeader(payload: X402PaymentPayload): string {
    return btoa(JSON.stringify(payload));
  }

  /**
   * Decode payment payload from base64 X-PAYMENT header
   */
  static decodePaymentHeader(header: string): X402PaymentPayload | null {
    try {
      return JSON.parse(atob(header));
    } catch (error) {
      console.error('Failed to decode payment header:', error);
      return null;
    }
  }
}
