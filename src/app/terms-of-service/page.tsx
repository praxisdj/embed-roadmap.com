"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Scale } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-rose-500/15 to-pink-500/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.08)_0%,transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center">
              <div className="text-lg font-bold text-white">E</div>
            </div>
            <span className="text-white font-semibold">Euler</span>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-rose-400/20 rounded-2xl flex items-center justify-center">
                <Scale className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Terms of Service
                </h1>
                <p className="text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="prose prose-invert prose-orange max-w-none">
              <div className="space-y-8 text-gray-300 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing and using Euler (the `Service`), you accept and
                    agree to be bound by the terms and provision of this
                    agreement. If you do not agree to abide by the above, please
                    do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    2. Description of Service
                  </h2>
                  <p>
                    Euler is a development boilerplate and toolkit designed to
                    help developers quickly start new projects. The Service
                    provides code templates, configurations, and development
                    tools to accelerate the development process.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    3. User Accounts
                  </h2>
                  <p>
                    To access certain features of the Service, you may be
                    required to create an account. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                    <li>
                      Maintaining the confidentiality of your account
                      credentials
                    </li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    4. Acceptable Use
                  </h2>
                  <p>You agree not to use the Service to:</p>
                  <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Distribute malicious software or harmful content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    5. Intellectual Property
                  </h2>
                  <p>
                    The Service and its original content, features, and
                    functionality are owned by Euler and are protected by
                    international copyright, trademark, patent, trade secret,
                    and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    6. Limitation of Liability
                  </h2>
                  <p>
                    In no event shall Euler be liable for any indirect,
                    incidental, special, consequential, or punitive damages,
                    including without limitation, loss of profits, data, use,
                    goodwill, or other intangible losses.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    7. Changes to Terms
                  </h2>
                  <p>
                    We reserve the right to modify or replace these Terms at any
                    time. If a revision is material, we will try to provide at
                    least 30 days notice prior to any new terms taking effect.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    8. Contact Information
                  </h2>
                  <p>
                    If you have any questions about these Terms of Service,
                    please contact us at{" "}
                    <a
                      href="mailto:legal@euler.dev"
                      className="text-orange-400 hover:text-orange-300 underline"
                    >
                      legal@euler.dev
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(15px) translateX(-15px);
          }
          66% {
            transform: translateY(-10px) translateX(15px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(8px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
