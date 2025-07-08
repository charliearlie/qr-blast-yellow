import React from "react";
import { SEO } from "@/components/SEO";
import QRGenerator from "@/components/QRGenerator";
import FeatureShowcase from "@/components/FeatureShowcase";
import Footer from "@/components/Footer";
import { featureData } from "@/config/features";

const LandingPage = () => {
  return (
    <>
      <SEO
        title="Blast QR: Intelligent & Dynamic QR Code Generator"
        description="Create dynamic, intelligent QR codes that adapt to time, location, and your changing needs. Free QR code generator with analytics, security, and custom designs."
        keywords="QR code generator, dynamic QR codes, intelligent QR codes, QR analytics, custom QR codes, free QR generator"
        ogType="website"
        canonical="/"
        ogImage="https://blastqr.com/img/qr-full.png"
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section with QR Generator */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h1 className="sr-only">Blast QR: Intelligent & Dynamic QR Code Generator</h1>
            <div className="flex items-center justify-center mb-4">
              <img
                src="/img/qr-full.png"
                alt="Blast QR Logo"
                className="w-32 h-32 md:w-48 md:h-48"
              />
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-6">
              INTELLIGENT & DYNAMIC{" "}
              <span className="text-primary relative">QR</span> CODES
            </h2>
            <p className="text-xl md:text-2xl font-bold text-muted-foreground max-w-4xl mx-auto mb-8">
              Go beyond static images. Create dynamic, intelligent QR codes that
              adapt to time, location, and your changing needs. Secure and
              powerful.
            </p>
          </div>

          {/* QR Generator - The Star of the Show */}
          <QRGenerator />
        </section>

        {/* Features Section */}
        <FeatureShowcase features={featureData} />

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
                <span className="text-primary">ABOUT</span> BLAST QR
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <p className="text-xl font-bold text-muted-foreground">
                  Blast QR is the next generation of QR code technology. We
                  believe QR codes should be more than just static images - they
                  should be intelligent, adaptable, and powerful tools for
                  businesses and individuals.
                </p>
                <p className="text-lg font-medium text-gray-600">
                  Our platform offers advanced features like time-based
                  redirects, geo-fencing, scan limits, and comprehensive
                  analytics, all while maintaining the simplicity and
                  accessibility that makes QR codes so effective.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary mb-2">
                      100%
                    </div>
                    <div className="text-lg font-bold uppercase">
                      Free Core Features
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary mb-2">
                      ∞
                    </div>
                    <div className="text-lg font-bold uppercase">
                      Unlimited QR Codes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary mb-2">
                      🔒
                    </div>
                    <div className="text-lg font-bold uppercase">
                      Security First
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
