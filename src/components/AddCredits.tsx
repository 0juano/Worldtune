import React, { useState } from 'react';
import { Check, CreditCard, Loader, Wallet, X } from 'lucide-react';
import { useCreditsStore } from '../store/useCreditsStore';
import { loadStripe } from '@stripe/stripe-js';

const CREDIT_PACKAGES = [
  { credits: 100, price: 5 },
  { credits: 500, price: 20 },
  { credits: 1000, price: 35 },
];

const SUPPORTED_STABLECOINS = [
  { symbol: 'USDC', name: 'USD Coin', icon: '💰' },
  { symbol: 'USDT', name: 'Tether', icon: '💵' },
  { symbol: 'DAI', name: 'Dai', icon: '🔸' },
];

export const AddCredits: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState<typeof CREDIT_PACKAGES[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | null>(null);
  const { addCredits } = useCreditsStore();

  const handleCardPayment = async () => {
    if (!selectedPackage) return;
    
    setPaymentStatus('processing');
    
    // Simulate card payment processing
    setTimeout(() => {
      setPaymentStatus('success');
      addCredits(selectedPackage.credits);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 3000);
  };

  const handleCryptoPayment = async () => {
    if (!selectedPackage) return;
    
    setPaymentStatus('processing');
    
    // Simulate transaction confirmation
    setTimeout(() => {
      setPaymentStatus('success');
      addCredits(selectedPackage.credits);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 5000);
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <Loader className="h-8 w-8 animate-spin text-wise-green" />
          <p className="text-lg font-medium text-wise-forest dark:text-wise-green">
            {paymentMethod === 'card' ? 'Processing payment...' : 'Waiting for transaction...'}
          </p>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
          <div className="rounded-full bg-wise-green/20 p-3">
            <Check className="h-8 w-8 text-wise-green" />
          </div>
          <p className="text-lg font-medium text-wise-forest dark:text-wise-green">
            Payment successful!
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-wise-forest dark:text-wise-green">Add Credits</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {paymentStatus ? (
          renderPaymentStatus()
        ) : !selectedPackage ? (
          <div className="grid gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.credits}
                onClick={() => setSelectedPackage(pkg)}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-wise-green dark:border-gray-700 dark:hover:border-wise-green"
              >
                <div>
                  <span className="text-lg font-medium text-wise-forest dark:text-wise-green">
                    {pkg.credits} Credits
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Best for {Math.round(pkg.credits / 10)} calls
                  </p>
                </div>
                <span className="text-xl font-semibold text-wise-green">
                  ${pkg.price}
                </span>
              </button>
            ))}
          </div>
        ) : !paymentMethod ? (
          <div className="grid gap-4">
            <button
              onClick={() => setPaymentMethod('card')}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-wise-green dark:border-gray-700 dark:hover:border-wise-green"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-wise-green" />
                <span className="font-medium text-wise-forest dark:text-wise-green">
                  Credit / Debit Card
                </span>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-wise-green dark:border-gray-700 dark:hover:border-wise-green"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-wise-green" />
                <span className="font-medium text-wise-forest dark:text-wise-green">
                  Stablecoins
                </span>
              </div>
            </button>
            <button
              onClick={() => setSelectedPackage(null)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ← Back to packages
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">Selected Package</p>
              <p className="text-lg font-medium text-wise-forest dark:text-wise-green">
                {selectedPackage.credits} Credits for ${selectedPackage.price}
              </p>
            </div>

            {paymentMethod === 'card' ? (
              <button
                onClick={handleCardPayment}
                className="w-full rounded-lg bg-wise-green py-3 text-center font-medium text-wise-forest hover:bg-wise-green/90 dark:bg-wise-green/80 dark:hover:bg-wise-green/70"
              >
                Pay with Card
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Select a stablecoin to pay with:
                </p>
                {SUPPORTED_STABLECOINS.map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={handleCryptoPayment}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-wise-green dark:border-gray-700 dark:hover:border-wise-green"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{coin.icon}</span>
                      <div>
                        <p className="font-medium text-wise-forest dark:text-wise-green">
                          {coin.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-wise-green">
                      ${selectedPackage.price}
                    </span>
                  </button>
                ))}

                {/* QR Code for crypto payments */}
                <div className="mt-4 flex flex-col items-center space-y-2 rounded-lg bg-white p-4 dark:bg-gray-700">
                  <div className="h-48 w-48 overflow-hidden rounded-lg bg-white p-2">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                      alt="Payment QR Code"
                      className="h-full w-full rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Scan to pay with {selectedPackage.price} {SUPPORTED_STABLECOINS[0].symbol}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setPaymentMethod(null)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ← Back to payment methods
            </button>
          </div>
        )}
      </div>
    </div>
  );
};