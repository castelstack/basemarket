'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get all query parameters
    const params = searchParams.toString();
    
    // Redirect to the payment verification page with all the same parameters
    router.replace(`/payment-verification${params ? `?${params}` : ''}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Redirecting to payment verification...</div>
    </div>
  );
}