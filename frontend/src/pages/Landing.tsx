import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { LinkIcon, BarChart2, QrCode, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">ClickMe</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                  Log in
                </Link>
                <Link to="/signup">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap size={16} /> Redis-powered performance
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Short links, <span className="text-primary">big results.</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              A developer-friendly URL shortener built for speed, advanced analytics, and custom branding. Take control of your links.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" className="w-full sm:w-auto text-lg gap-2">
                  Create your first link <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg bg-background">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-12 bg-accent/30 border-y border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-border bg-card flex flex-col transform md:-translate-y-24">
              <div className="h-12 border-b border-border bg-muted/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="ml-4 bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground flex-1 max-w-md flex items-center gap-2">
                  <LinkIcon size={12} /> app.clickme.com/dashboard
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2 space-y-6">
                  <div className="h-32 bg-accent rounded-lg border border-border flex items-center justify-center text-muted-foreground">Chart Preview</div>
                  <div className="h-48 bg-accent rounded-lg border border-border"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-24 bg-accent rounded-lg border border-border"></div>
                  <div className="h-24 bg-accent rounded-lg border border-border"></div>
                  <div className="h-24 bg-accent rounded-lg border border-border"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Everything you need</h2>
              <p className="mt-4 text-lg text-muted-foreground">Built with modern tech for reliability and speed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <BarChart2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Deep Analytics</h3>
                <p className="text-muted-foreground">
                  Track every click with pinpoint accuracy. View browser, OS, and geographic data perfectly visualized.
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <QrCode size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Instant QR Codes</h3>
                <p className="text-muted-foreground">
                  Every short link automatically generates a downloadable QR code. Perfect for print marketing.
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security built on Spring Boot. Your data is encrypted and completely isolated.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <LinkIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">ClickMe</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ClickMe Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
