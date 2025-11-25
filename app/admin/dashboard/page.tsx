'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  DollarSign,
  Clock,
  XCircle,
  Download,
  CheckCircle2,
  X,
  LogOut,
  Settings,
  Search,
  Eye,
  Calendar,
  Mail,
  Phone,
  Trophy,
} from 'lucide-react';

type Registration = {
  id: string;
  registration_number: number | null;
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
  slip_id: string | null;
  transaction_id: string | null;
  screenshot_url: string | null;
  status: string;
  created_at: string;
};

type Stats = {
  total: number;
  paid: number;
  pendingOnline: number;
  pendingCash: number;
  rejected: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    paid: 0,
    pendingOnline: 0,
    pendingCash: 0,
    rejected: 0,
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [savingDiscount, setSavingDiscount] = useState(false);

  useEffect(() => {
    // Verify authentication
    fetch('/api/admin/verify')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          loadData();
        } else {
          router.push('/admin/login');
        }
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadData = () => {
    // Load stats with cache-busting
    fetch('/api/stats?' + new URLSearchParams({ _t: Date.now().toString() }), {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch(console.error);

    // Load registrations
    fetchRegistrations();
  };

  const fetchRegistrations = () => {
    const params = new URLSearchParams();
    if (filter !== 'all') {
      if (filter === 'paid') params.set('status', 'paid');
      else if (filter === 'pending_online') params.set('status', 'pending_online');
      else if (filter === 'pending_cash') params.set('status', 'pending_cash');
    }

    fetch(`/api/registrations?${params.toString()}`, {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRegistrations(data.data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (authenticated) {
      fetchRegistrations();
    }
  }, [filter, authenticated]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        loadData(); // Reload all data
      } else {
        alert('Failed to update status: ' + data.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        loadData();
      } else {
        alert('Failed to delete: ' + data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete registration');
    }
  };

  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleView = (reg: Registration) => {
    setSelectedRegistration(reg);
    setDiscountValue(reg.discount?.toString() || '0');
    setEditingDiscount(false);
    setViewDialogOpen(true);
  };

  const handleSaveDiscount = async () => {
    if (!selectedRegistration) return;

    const discountNum = parseFloat(discountValue) || 0;
    if (discountNum < 0) {
      alert('Discount cannot be negative');
      return;
    }

    setSavingDiscount(true);
    try {
      const response = await fetch(`/api/registrations/${selectedRegistration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: selectedRegistration.status,
          discount: discountNum
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setSelectedRegistration({ ...selectedRegistration, discount: discountNum });
        setEditingDiscount(false);
        // Reload registrations to reflect changes
        fetchRegistrations();
        alert('Discount updated successfully!');
      } else {
        alert('Failed to update discount: ' + data.error);
      }
    } catch (error) {
      console.error('Update discount error:', error);
      alert('Failed to update discount');
    } finally {
      setSavingDiscount(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    let selectedGames: string[] = [];
    if (Array.isArray(reg.selected_games)) {
      selectedGames = reg.selected_games;
    } else if (typeof reg.selected_games === 'string') {
      try {
        selectedGames = JSON.parse(reg.selected_games);
      } catch {
        selectedGames = [];
      }
    }
    const gamesString = selectedGames.join(' ').toLowerCase();
    
    return (
      reg.name.toLowerCase().includes(search) ||
      reg.roll_number.toLowerCase().includes(search) ||
      reg.email.toLowerCase().includes(search) ||
      gamesString.includes(search) ||
      (reg.registration_number && reg.registration_number.toString().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all registrations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/esports')}
                className="border-blue-200 hover:bg-blue-50 text-sm sm:text-base w-full sm:w-auto"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Esports Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-red-200 hover:bg-red-50 text-sm sm:text-base w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-gray-700 text-xs sm:text-sm">Total</CardDescription>
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Registrations</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-gray-700 text-xs sm:text-sm">Paid</CardDescription>
                <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-gray-700 text-xs sm:text-sm">Pending</CardDescription>
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-yellow-600">{stats.pendingOnline}</div>
              <p className="text-xs text-gray-500 mt-1">Online</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-gray-700 text-xs sm:text-sm">Pending</CardDescription>
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-orange-600">{stats.pendingCash}</div>
              <p className="text-xs text-gray-500 mt-1">Cash</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardDescription className="font-semibold text-gray-700 text-xs sm:text-sm">Rejected</CardDescription>
                <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-xl sm:text-3xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-gray-500 mt-1">Declined</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-4 sm:mb-6 shadow-lg border-2">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, roll number, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-11 border-2 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-56 h-10 sm:h-11 border-2 text-sm sm:text-base">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Registrations</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending_online">Pending (Online)</SelectItem>
                    <SelectItem value="pending_cash">Pending (Cash)</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} className="h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Registrations</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {filteredRegistrations.length} registration(s) found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2">
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Reg #</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Roll No</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Games</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Payment</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left p-3 sm:p-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg, index) => {
                    let selectedGames: string[] = [];
                    if (Array.isArray(reg.selected_games)) {
                      selectedGames = reg.selected_games;
                    } else if (typeof reg.selected_games === 'string') {
                      try {
                        selectedGames = JSON.parse(reg.selected_games);
                      } catch {
                        selectedGames = [];
                      }
                    }
                    return (
                    <tr 
                      key={reg.id} 
                      className={`border-b hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="p-3 sm:p-4">
                        {reg.registration_number ? (
                          <span className="font-bold text-blue-600 text-sm">#{reg.registration_number}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-sm">{reg.name}</td>
                      <td className="p-3 sm:p-4 text-sm">{reg.roll_number}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="text-xs text-gray-500 capitalize">{reg.gender}</span>
                            <div className="text-xs sm:text-sm font-medium">
                              {selectedGames.length > 0 
                                ? `${selectedGames.length} game(s)`
                                : 'No games'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="font-semibold text-green-600 text-sm">
                          Rs. {reg.total_amount?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="capitalize font-medium text-sm">{reg.payment_method}</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            reg.status === 'paid'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : reg.status === 'pending_online' || reg.status === 'pending_cash'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {reg.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {new Date(reg.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(reg)}
                            className="border-blue-300 hover:bg-blue-50 h-7 sm:h-8 px-2 sm:px-3"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          {reg.status !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(reg.id, 'paid')}
                              className="border-green-300 hover:bg-green-50 text-green-700 h-7 sm:h-8 px-2 sm:px-3 text-xs"
                            >
                              Approve
                            </Button>
                          )}
                          {reg.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(reg.id, 'rejected')}
                              className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                            >
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(reg.id)}
                            className="hover:bg-red-50 text-red-600 h-7 sm:h-8 px-2 sm:px-3"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {filteredRegistrations.map((reg, index) => {
                let selectedGames: string[] = [];
                if (Array.isArray(reg.selected_games)) {
                  selectedGames = reg.selected_games;
                } else if (typeof reg.selected_games === 'string') {
                  try {
                    selectedGames = JSON.parse(reg.selected_games);
                  } catch {
                    selectedGames = [];
                  }
                }
                return (
                  <div
                    key={reg.id}
                    className={`border-b p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {reg.registration_number ? (
                          <span className="font-bold text-blue-600 text-sm">#{reg.registration_number}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">No Reg #</span>
                        )}
                        <h3 className="font-semibold text-base mt-1">{reg.name}</h3>
                        <p className="text-sm text-gray-600">Roll: {reg.roll_number}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reg.status === 'paid'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : reg.status === 'pending_online' || reg.status === 'pending_cash'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {reg.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600 capitalize">{reg.gender}</span>
                        <span className="text-gray-500">•</span>
                        <span>{selectedGames.length} game(s)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-green-600">
                          Rs. {reg.total_amount?.toLocaleString() || '0'}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="capitalize">{reg.payment_method}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(reg.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(reg)}
                        className="border-blue-300 hover:bg-blue-50 text-xs flex-1 min-w-[80px]"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {reg.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(reg.id, 'paid')}
                          className="border-green-300 hover:bg-green-50 text-green-700 text-xs flex-1 min-w-[80px]"
                        >
                          Approve
                        </Button>
                      )}
                      {reg.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(reg.id, 'rejected')}
                          className="text-xs flex-1 min-w-[80px]"
                        >
                          Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(reg.id)}
                        className="hover:bg-red-50 text-red-600 text-xs"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base sm:text-lg">No registrations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">Registration Details</DialogTitle>
            <DialogDescription className="text-sm">Complete information about this registration</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4 sm:space-y-6 mt-4">
              {/* Personal Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold text-sm sm:text-base break-words">{selectedRegistration.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Roll Number</p>
                    <p className="font-semibold text-sm sm:text-base">{selectedRegistration.roll_number}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Gender</p>
                    <p className="font-semibold capitalize text-sm sm:text-base">{selectedRegistration.gender}</p>
                  </div>
                  {selectedRegistration.alternative_contact_number && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Alternative Contact</p>
                      <p className="font-semibold flex items-center gap-2 text-sm sm:text-base break-all">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        {selectedRegistration.alternative_contact_number}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Contact Number</p>
                    <p className="font-semibold flex items-center gap-2 text-sm sm:text-base break-all">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {selectedRegistration.contact_number}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-600">Email</p>
                    <p className="font-semibold flex items-center gap-2 text-sm sm:text-base break-all">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {selectedRegistration.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Games Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Selected Games
                </h3>
                <div className="mb-3">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {Array.isArray(selectedRegistration.selected_games) 
                      ? selectedRegistration.selected_games.length 
                      : typeof selectedRegistration.selected_games === 'string'
                        ? JSON.parse(selectedRegistration.selected_games).length
                        : 0} game(s) selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedRegistration.selected_games)
                      ? selectedRegistration.selected_games
                      : typeof selectedRegistration.selected_games === 'string'
                        ? JSON.parse(selectedRegistration.selected_games)
                        : []).map((game: string) => (
                      <span
                        key={game}
                        className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {game}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-lg border-2 border-yellow-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold capitalize text-sm sm:text-base">{selectedRegistration.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Status</p>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        selectedRegistration.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : selectedRegistration.status === 'pending_online' || selectedRegistration.status === 'pending_cash'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedRegistration.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Original Amount</p>
                    <p className="font-semibold text-gray-700 text-base sm:text-lg">
                      Rs. {selectedRegistration.total_amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Discount</p>
                    {editingDiscount ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="w-24 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveDiscount}
                          disabled={savingDiscount}
                          className="h-8"
                        >
                          {savingDiscount ? '...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDiscountValue(selectedRegistration.discount?.toString() || '0');
                            setEditingDiscount(false);
                          }}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-red-600 text-base sm:text-lg">
                          Rs. {(selectedRegistration.discount || 0).toLocaleString()}
                        </p>
                        {selectedRegistration.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingDiscount(true)}
                            className="h-6 text-xs"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-600">Final Amount</p>
                    <p className="font-semibold text-green-600 text-xl sm:text-2xl">
                      Rs. {(selectedRegistration.total_amount - (selectedRegistration.discount || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Reference ID</p>
                    <p className="font-semibold font-mono text-blue-600 text-xs sm:text-sm break-all">
                      {selectedRegistration.slip_id || 'N/A'}
                    </p>
                  </div>
                  {selectedRegistration.transaction_id && (
                    <div className="sm:col-span-2">
                      <p className="text-xs sm:text-sm text-gray-600">Transaction ID</p>
                      <p className="font-semibold font-mono text-xs sm:text-sm break-all">{selectedRegistration.transaction_id}</p>
                    </div>
                  )}
                </div>
                {selectedRegistration.screenshot_url && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">Payment Screenshot</p>
                    <img
                      src={selectedRegistration.screenshot_url}
                      alt="Payment Screenshot"
                      className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Registration Details */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Registration Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Registration Number</p>
                    <p className="font-semibold font-mono text-base sm:text-lg text-blue-600">
                      {selectedRegistration.registration_number ? `#${selectedRegistration.registration_number}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Registration ID</p>
                    <p className="font-semibold font-mono text-xs sm:text-sm break-all">{selectedRegistration.id}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-600">Registration Date</p>
                    <p className="font-semibold text-sm sm:text-base">
                      {new Date(selectedRegistration.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
