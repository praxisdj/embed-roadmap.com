"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Privacy Policy
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
                    1. Information We Collect
                  </h2>
                  <p>
                    We collect information you provide directly to us, such as
                    when you create an account, use our services, or contact us
                    for support.
                  </p>
                  <h3 className="text-xl font-medium text-orange-300 mt-4 mb-2">
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                    <li>Name and email address (via Google OAuth)</li>
                    <li>Profile information from your Google account</li>
                    <li>Usage data and preferences</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    2. How We Use Your Information
                  </h2>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    3. Information Sharing
                  </h2>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal
                    information to third parties without your consent, except as
                    described in this policy:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                    <li>With service providers who assist in our operations</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>In connection with a business transfer</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    4. Data Security
                  </h2>
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your personal information against
                    unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    5. Data Retention
                  </h2>
                  <p>
                    We retain your personal information for as long as necessary
                    to provide our services and fulfill the purposes outlined in
                    this policy, unless a longer retention period is required by
                    law.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    6. Your Rights
                  </h2>
                  <p>
                    Depending on your location, you may have the following
                    rights:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
                    <li>Access to your personal information</li>
                    <li>Correction of inaccurate information</li>
                    <li>Deletion of your personal information</li>
                    <li>Restriction of processing</li>
                    <li>Data portability</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    7. Cookies and Tracking
                  </h2>
                  <p>
                    We use cookies and similar tracking technologies to collect
                    information about your browsing activities and to provide
                    personalized content and advertisements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    8. Changes to This Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any changes by posting the new Privacy Policy
                    on this page and updating the `Last updated` date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    9. Contact Us
                  </h2>
                  <p>
                    If you have any questions about this Privacy Policy, please
                    contact us at{" "}
                    <a
                      href="mailto:privacy@euler.dev"
                      className="text-orange-400 hover:text-orange-300 underline"
                    >
                      privacy@euler.dev
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
