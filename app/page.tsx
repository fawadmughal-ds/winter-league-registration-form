'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, Shield, Zap, Award, Target, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const traditionalSports = [
    { name: 'Football', icon: '⚽', color: 'from-green-500 to-emerald-600' },
    { name: 'Cricket', icon: '🏏', color: 'from-blue-500 to-cyan-600' },
    { name: 'Table Tennis', icon: '🏓', color: 'from-orange-500 to-red-600' },
    { name: 'Badminton', icon: '🏸', color: 'from-purple-500 to-pink-600' },
  ];
  
  const esports = [
    { name: 'FIFA', icon: '🎮', color: 'from-indigo-500 to-purple-600' },
    { name: 'Tekken', icon: '🥊', color: 'from-red-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Winter League 2025</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FCIT Sports Society
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
              Registration Portal
            </p>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Join the most exciting sports competition of the year. Register now and be part of the action!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
                  Register Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-blue-50 shadow-md">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sports Categories */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sports Categories</h2>
          <p className="text-xl text-gray-600">Choose your favorite sport and compete</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Traditional Sports */}
          <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1">
              <CardHeader className="bg-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  Traditional Sports
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Physical sports competitions
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {traditionalSports.map((sport) => (
                  <div
                    key={sport.name}
                    className={`p-6 rounded-xl bg-gradient-to-br ${sport.color} text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
                  >
                    <div className="text-4xl mb-2">{sport.icon}</div>
                    <div className="font-bold text-lg">{sport.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Esports */}
          <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1">
              <CardHeader className="bg-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  Esports
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Competitive gaming tournaments
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4 max-w-md mx-auto">
                {esports.map((game) => (
                  <div
                    key={game.name}
                    className={`p-6 rounded-xl bg-gradient-to-br ${game.color} text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
                  >
                    <div className="text-4xl mb-2">{game.icon}</div>
                    <div className="font-bold text-lg">{game.name}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
                <p className="text-sm text-yellow-900 font-semibold flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <strong>OC esports</strong> matches will be held in OC on scheduled dates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Register With Us?</h2>
            <p className="text-xl text-gray-600">Experience the best sports registration system</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Easy Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Simple multi-step registration process for all sports categories. Complete your registration in minutes!
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Multiple Payment Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Choose between online payment or cash payment at the desk. We support all convenient payment methods.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  All registrations are verified and tracked securely. Your data is safe with us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">2025</div>
                <div className="text-blue-100">Winter League</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">8+</div>
                <div className="text-blue-100">Sports Categories</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Registration Open</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-blue-100">Secure & Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
            <CardContent className="p-12">
              <Award className="h-16 w-16 text-blue-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Compete?</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Don't miss out on the biggest sports event of the year. Register now and showcase your skills!
              </p>
              <Link href="/register">
                <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400">© 2025 FCIT Sports Society. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-2">Winter League 2025 Registration Portal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
