'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

function SuccessContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('id');
  const registrationNumber = searchParams.get('regNum');
  const slipId = searchParams.get('slipId');
  const method = searchParams.get('method');
  const transactionId = searchParams.get('transactionId');
  const total = searchParams.get('total');
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    if (slipId) {
      // For cash payments, create a URL that can be scanned to verify and approve
      // For online payments, include transaction details
      let qrData: string;
      
      if (method === 'cash' && registrationNumber) {
        // Cash payment: Create a verification URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        qrData = `${baseUrl}/verify-cash?regNum=${registrationNumber}&slipId=${slipId}`;
      } else {
        // Online payment: Include structured data
        qrData = JSON.stringify({
          type: 'FCIT_Sports_Registration',
          registrationNumber: registrationNumber || '',
          slipId: slipId,
          registrationId: registrationId || '',
          amount: total || '0',
          method: method || '',
          transactionId: transactionId || '',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate QR code with better error correction and size
      QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H', // High error correction for better scanning
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCode(url))
        .catch(console.error);
    }
  }, [slipId, registrationNumber, registrationId, total, method, transactionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600">Registration Successful!</CardTitle>
            <CardDescription className="text-lg">
              Your registration has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {registrationNumber && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="font-semibold mb-2">Registration Number:</p>
                <p className="text-3xl font-mono text-blue-600 font-bold">#{registrationNumber}</p>
              </div>
            )}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Registration ID:</p>
              <p className="text-xl font-mono text-blue-600">{registrationId}</p>
            </div>
            {total && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-semibold mb-2">Total Amount:</p>
                <p className="text-2xl font-bold text-green-700">Rs. {parseFloat(total).toLocaleString()}</p>
              </div>
            )}

            {method === 'cash' && slipId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Cash Payment Slip
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                    <p className="font-semibold mb-2">Slip ID:</p>
                    <p className="text-2xl font-mono text-yellow-800">{slipId}</p>
                  </div>

                  {qrCode && (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg">
                        <img 
                          src={qrCode} 
                          alt="QR Code" 
                          className="w-64 h-64"
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Scan this QR code to verify your registration
                      </p>
                    </div>
                  )}

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 font-medium">
                      ⚠️ Important: Bring this slip and pay at the FCIT Sports Society desk to complete your registration.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head><title>Cash Slip - ${slipId}</title></head>
                            <body style="font-family: Arial; padding: 40px; text-align: center;">
                              <h1>FCIT Sports Society</h1>
                              <h2>Winter League 2025</h2>
                              <h3>Cash Payment Slip</h3>
                              <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">${slipId}</p>
                              <p>Registration ID: ${registrationId}</p>
                              <p style="margin-top: 40px;">Please bring this slip to complete payment at the desk.</p>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Print Slip
                  </Button>
                </CardContent>
              </Card>
            )}

            {method === 'online' && slipId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Online Payment Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="font-semibold mb-2">Reference ID:</p>
                    <p className="text-2xl font-mono text-blue-800">{slipId}</p>
                  </div>

                  {qrCode && (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-lg">
                        <img 
                          src={qrCode} 
                          alt="QR Code" 
                          className="w-64 h-64"
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Scan this QR code to verify your registration
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      ✓ Your payment is under verification. You will be notified once it's approved.
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      Transaction ID: {transactionId || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full">
                  Register Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

