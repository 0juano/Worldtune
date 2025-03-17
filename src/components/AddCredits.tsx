import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Loader, Wallet, X } from 'lucide-react';
import { useCreditsStore } from '../store/useCreditsStore';
import { playSound, preloadSound } from '../utils/audio';
import useAudioContext from '../utils/useAudioContext';

// Call rates in cents per minute
const MIN_RATE = 2.3; // 2.3¢ per minute (lowest rate)
const MAX_RATE = 6.0; // 6¢ per minute (highest rate)

const CREDIT_PACKAGES = [
  { 
    credits: 100, 
    price: 5,
    minMinutes: Math.floor(5 * 100 / MAX_RATE), // Minimum minutes (at highest rate)
    maxMinutes: Math.floor(5 * 100 / MIN_RATE)  // Maximum minutes (at lowest rate)
  },
  { 
    credits: 500, 
    price: 20,
    minMinutes: Math.floor(20 * 100 / MAX_RATE),
    maxMinutes: Math.floor(20 * 100 / MIN_RATE)
  },
  { 
    credits: 1000, 
    price: 35,
    minMinutes: Math.floor(35 * 100 / MAX_RATE),
    maxMinutes: Math.floor(35 * 100 / MIN_RATE)
  },
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
  const { audioContext } = useAudioContext();

  // Preload the cash register sound when component mounts
  useEffect(() => {
    preloadSound('cash-register');
  }, []);

  const handleCardPayment = async () => {
    if (!selectedPackage) return;
    
    setPaymentStatus('processing');
    
    // Simulate card payment processing
    setTimeout(async () => {
      setPaymentStatus('success');
      addCredits(selectedPackage.credits);
      
      // Play cash register sound on successful payment
      await playSound('cash-register', 'mp3', 0.7, audioContext);
      
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
    setTimeout(async () => {
      setPaymentStatus('success');
      addCredits(selectedPackage.credits);
      
      // Play cash register sound on successful payment
      await playSound('cash-register', 'mp3', 0.7, audioContext);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 5000);
  };

  const renderPaymentStatus = () => {
    if (paymentStatus === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="h-12 w-12 animate-spin text-wise-green mb-4" />
          <p className="text-center text-lg font-medium">
            {paymentMethod === 'card' ? 'Processing payment...' : 'Waiting for transaction...'}
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please don't close this window
          </p>
        </div>
      );
    }
    
    if (paymentStatus === 'success') {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900 mb-4">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-center text-lg font-medium">Payment successful!</p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            USD {selectedPackage?.price} has been added to your account
          </p>
        </div>
      );
    }
    
    return null;
  };

  // If payment is being processed or completed, show status
  if (paymentStatus) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Funds</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700 focus-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderPaymentStatus()}
      </div>
    );
  }

  // Payment method selection screen
  if (selectedPackage && !paymentMethod) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Funds</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700 focus-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <p className="font-medium">Selected Package</p>
          <p className="text-lg font-bold mt-1">USD {selectedPackage.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Approximately {selectedPackage.minMinutes}-{selectedPackage.maxMinutes} minutes of call time
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Payment method</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="mr-3 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Credit / Debit Card</span>
              </div>
              <span className="text-sm font-medium">USD {selectedPackage.price}</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('crypto')}
              className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="mr-3 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Stablecoins</span>
              </div>
              <span className="text-sm font-medium">USD {selectedPackage.price}</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setSelectedPackage(null)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Back to packages
        </button>
      </div>
    );
  }

  // Crypto payment screen
  if (selectedPackage && paymentMethod === 'crypto') {
    return (
      <div className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pay with Stablecoin</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700 focus-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Select a stablecoin to pay with:
          </p>
          <div className="space-y-3">
            {SUPPORTED_STABLECOINS.map((coin) => (
              <button
                key={coin.symbol}
                onClick={handleCryptoPayment}
                className="flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{coin.icon}</span>
                  <div>
                    <p className="font-medium">{coin.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{coin.symbol}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">USD {selectedPackage.price}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* QR Code for crypto payments */}
        <div className="mb-6 flex flex-col items-center space-y-2 rounded-lg bg-white p-4 dark:bg-gray-700">
          <div className="h-48 w-48 overflow-hidden rounded-lg bg-white p-2">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
              alt="Payment QR Code"
              className="h-full w-full rounded"
            />
          </div>
          <p className="text-sm text-center text-gray-600 dark:text-gray-300">
            Scan to pay with {selectedPackage.price} {SUPPORTED_STABLECOINS[0].symbol}
          </p>
        </div>
        
        <button
          onClick={() => setPaymentMethod(null)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Back to payment methods
        </button>
      </div>
    );
  }

  // Card payment screen
  if (selectedPackage && paymentMethod === 'card') {
    return (
      <div className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pay with Card</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700 focus-ring"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <p className="font-medium">Amount</p>
          <p className="text-lg font-bold mt-1">USD {selectedPackage.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Approximately {selectedPackage.minMinutes}-{selectedPackage.maxMinutes} minutes of call time
          </p>
        </div>
        
        <div className="mb-6">
          <button
            onClick={handleCardPayment}
            className="w-full rounded-lg bg-wise-green py-3 text-center font-medium text-wise-forest hover:bg-wise-green/90 dark:bg-wise-green/80 dark:hover:bg-wise-green/70"
          >
            Pay USD {selectedPackage.price}
          </button>
        </div>
        
        <button
          onClick={() => setPaymentMethod(null)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Back to payment methods
        </button>
      </div>
    );
  }

  // Package selection screen (default)
  return (
    <div className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Add Funds</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700 focus-ring"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Select a package</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.credits}
              onClick={() => setSelectedPackage(pkg)}
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedPackage === pkg
                  ? 'border-wise-green bg-wise-green/5 dark:border-wise-green dark:bg-wise-green/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-2xl font-bold">USD {pkg.price}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{pkg.minMinutes}-{pkg.maxMinutes} min</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
        <div className="flex items-start">
          <Wallet className="mr-3 h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Secure payment</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your payment information is processed securely. We do not store credit card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};