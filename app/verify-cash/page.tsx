'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, DollarSign, User, Phone, Mail, Trophy, Lock } from 'lucide-react';

type Registration = {
  id: string;
  registration_number: number;
  email: string;
  name: string;
  roll_number: string;
  contact_number: string;
  alternative_contact_number: string | null;
  gender: string;
  selected_games: string[] | string;
  total_amount: number;
  discount: number | null;
  payment_method: string;
  slip_id: string;
  status: string;
  created_at: string;
};

function VerifyCashContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regNum = searchParams.get('regNum');
  const slipId = searchParams.get('slipId');
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [discount, setDiscount] = useState<string>('0');

  useEffect(() => {
    // Check admin authentication first
    checkAuth();
  }, []);

  useEffect(() => {
    // Only fetch registration if authenticated
    if (authenticated && (regNum || slipId)) {
      fetchRegistration();
    } else if (!checkingAuth && !authenticated) {
      setShowLogin(true);
      setLoading(false);
    }
  }, [authenticated, regNum, slipId, checkingAuth]);

  useEffect(() => {
    // Set discount from registration when loaded
    if (registration && registration.discount !== null && registration.discount !== undefined) {
      setDiscount(registration.discount.toString());
    }
  }, [registration]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      const data = await response.json();
      if (data.authenticated) {
        setAuthenticated(true);
      } else {
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setShowLogin(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        setAuthenticated(true);
        setShowLogin(false);
        // Fetch registration after login
        if (regNum || slipId) {
          fetchRegistration();
        }
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchRegistration = async () => {
    try {
      const params = new URLSearchParams();
      if (regNum) params.set('regNum', regNum);
      if (slipId) params.set('slipId', slipId);

      const response = await fetch(`/api/registrations/verify?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRegistration(data.data);
      } else {
        setError(data.error || 'Registration not found');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError('Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!registration) return;

    setApproving(true);
    try {
      const discountValue = parseFloat(discount) || 0;
      if (discountValue < 0) {
        alert('Discount cannot be negative');
        setApproving(false);
        return;
      }

      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'paid',
          discount: discountValue
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Reload registration data
        await fetchRegistration();
        alert('Payment approved successfully!');
      } else {
        alert('Failed to approve: ' + data.error);
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve payment');
    } finally {
      setApproving(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {checkingAuth ? 'Verifying access...' : 'Loading registration details...'}
          </p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (showLogin && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-center">Admin Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please login to verify and approve cash payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{loginError}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loggingIn}>
                {loggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/login')}
                className="text-sm"
              >
                Go to Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-center text-red-600">Verification Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-4">{error || 'Registration not found'}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedGames = Array.isArray(registration.selected_games)
    ? registration.selected_games
    : typeof registration.selected_games === 'string'
    ? JSON.parse(registration.selected_games)
    : [];

  const isPaid = registration.status === 'paid';
  const isPendingCash = registration.status === 'pending_cash';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Cash Payment Verification
            </CardTitle>
            <CardDescription className="text-blue-100">
              Verify and approve cash payment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Status Banner */}
            {isPaid && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <p className="font-semibold text-green-800">Payment Already Approved</p>
                </div>
              </div>
            )}

            {/* Registration Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Registration Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Registration #:</span>
                    <span className="font-bold text-blue-600 ml-2">
                      #{registration.registration_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Slip ID:</span>
                    <span className="font-mono font-semibold ml-2">{registration.slip_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold ml-2">{registration.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Roll Number:</span>
                    <span className="font-semibold ml-2">{registration.roll_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-semibold ml-2 capitalize">{registration.gender}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-semibold ml-2">{registration.contact_number}</span>
                  </div>
                  {registration.alternative_contact_number && (
                    <div>
                      <span className="text-gray-600">Alternative:</span>
                      <span className="font-semibold ml-2">
                        {registration.alternative_contact_number}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold ml-2 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {registration.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Games and Amount */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                Selected Games & Amount
              </h3>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  {selectedGames.length} game(s) selected:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedGames.map((game: string) => (
                    <span
                      key={game}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {game}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-3xl font-bold text-green-600">
                    Rs. {registration.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {registration.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Registered: {new Date(registration.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Discount Field and Approve Button */}
            {isPendingCash && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <Label htmlFor="discount" className="text-sm sm:text-base font-semibold mb-2 block">
                    Discount Amount (Rs.)
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="1"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="text-base sm:text-lg font-semibold"
                  />
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    Enter discount amount (e.g., 200). Final amount will be: Rs. {(registration.total_amount - (parseFloat(discount) || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                  >
                    {approving ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Approve Cash Payment
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => router.push('/admin/dashboard')}
                    variant="outline"
                    className="px-6"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {isPaid && (
              <div className="text-center">
                <Button
                  onClick={() => router.push('/admin/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyCashPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyCashContent />
    </Suspense>
  );
}
