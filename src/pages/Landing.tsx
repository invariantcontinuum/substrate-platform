/**
 * Landing Page
 * Entry point for unauthenticated users
 * Shows product features, pricing, and authentication options
 * Following DRY, KISS, and SOLID principles
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  GitBranch,
  Brain,
  Users,
  Zap,
  BarChart3,
  Lock,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Network,
  AlertTriangle,
  FileText,
  Settings,
  Globe,
  Code,
  Database,
  Server,
  Layers,
  Workflow,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLandingContent } from '@/api/hooks';

// ============================================================================
// Icon Mapping
// ============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  Shield,
  GitBranch,
  Users,
  BarChart3,
  Lock,
  Network,
  AlertTriangle,
  FileText,
  Settings,
  Globe,
  Code,
  Database,
  Server,
  Layers,
  Workflow,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
};

// ============================================================================
// Types
// ============================================================================

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ============================================================================
// Loading Components
// ============================================================================

const FeaturesSkeleton: React.FC = () => (
  <section id="features" className="py-20 bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="h-10 bg-slate-800 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-slate-800 rounded-lg w-1/2 mx-auto animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4 animate-pulse" />
            <div className="h-6 bg-slate-800 rounded-lg w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-800 rounded-lg w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PricingSkeleton: React.FC = () => (
  <section id="pricing" className="py-20 bg-slate-900/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="h-10 bg-slate-800 rounded-lg w-1/2 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-slate-800 rounded-lg w-1/3 mx-auto animate-pulse" />
      </div>
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="h-6 bg-slate-800 rounded-lg w-1/3 mx-auto mb-4 animate-pulse" />
            <div className="h-10 bg-slate-800 rounded-lg w-1/4 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-slate-800 rounded-lg w-1/2 mx-auto mb-6 animate-pulse" />
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-4 bg-slate-800 rounded-lg w-full animate-pulse" />
              ))}
            </div>
            <div className="h-10 bg-slate-800 rounded-lg w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQSkeleton: React.FC = () => (
  <section id="faq" className="py-20 bg-slate-950">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="h-10 bg-slate-800 rounded-lg w-2/3 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-slate-800 rounded-lg w-1/2 mx-auto animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-6 bg-slate-900/30 border border-slate-800 rounded-xl">
            <div className="h-5 bg-slate-800 rounded-lg w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================================
// Components
// ============================================================================

const Navbar: React.FC<{ onLogin: () => void; onSignup: () => void }> = ({ onLogin, onSignup }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Substrate</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-slate-400 hover:text-white transition-colors">
              FAQ
            </a>
            <a 
              href="https://invariantcontinuum.github.io/substrate-platform/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
            >
              Sign up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-4 space-y-3">
            <a 
              href="#features" 
              className="block text-slate-400 hover:text-white py-2"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="block text-slate-400 hover:text-white py-2"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#faq" 
              className="block text-slate-400 hover:text-white py-2"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </a>
            <hr className="border-slate-800" />
            <button
              onClick={() => {
                onLogin();
                setIsOpen(false);
              }}
              className="block w-full text-left text-slate-300 hover:text-white py-2"
            >
              Log in
            </button>
            <button
              onClick={() => {
                onSignup();
                setIsOpen(false);
              }}
              className="block w-full text-left text-blue-400 hover:text-blue-300 py-2"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

interface HeroProps {
  onGetStarted: () => void;
  trustBadges?: { companies: string[]; certifications: string[] };
  isLoading?: boolean;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, trustBadges, isLoading }) => (
  <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
    
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }}
    />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
        <Zap className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-blue-400">Now with AI-powered GraphRAG</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        Governance for the
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI-Generated Era
        </span>
      </h1>

      {/* Subheadline */}
      <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 mb-10">
        Substrate Platform restores architectural control and visibility over AI-accelerated code. 
        Govern your codebase with a live knowledge graph that understands intent, detects drift, 
        and preserves institutional memory.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onGetStarted}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2 group"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <a
          href="https://demo.substrate.io"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          View Demo
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Trust badges */}
      <div className="mt-16 pt-8 border-t border-slate-800/50">
        <p className="text-sm text-slate-500 mb-4">Trusted by engineering teams at</p>
        {isLoading ? (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-24 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {(trustBadges?.companies || ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Spotify']).map((company) => (
              <span key={company} className="text-slate-400 font-semibold text-lg">
                {company}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
);

interface FeaturesProps {
  features: Feature[];
  isLoading?: boolean;
}

const Features: React.FC<FeaturesProps> = ({ features, isLoading }) => {
  if (isLoading) {
    return <FeaturesSkeleton />;
  }

  return (
    <section id="features" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to govern your architecture
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete platform for understanding, enforcing, and evolving your software architecture.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface PricingProps {
  pricingTiers: PricingTier[];
  onSelectPlan: (plan: string) => void;
  isLoading?: boolean;
}

const Pricing: React.FC<PricingProps> = ({ pricingTiers, onSelectPlan, isLoading }) => {
  if (isLoading) {
    return <PricingSkeleton />;
  }

  return (
    <section id="pricing" className="py-20 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start free and scale as your team grows. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "relative p-8 rounded-2xl border",
                tier.popular
                  ? "bg-blue-500/5 border-blue-500/30 lg:scale-105"
                  : "bg-slate-900 border-slate-800"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                </div>
                <span className="text-slate-500">{tier.period}</span>
                <p className="text-slate-400 mt-3 text-sm">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(tier.name)}
                className={cn(
                  "w-full py-3 rounded-lg font-medium transition-colors",
                  tier.popular
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                )}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface FAQProps {
  faqItems: FAQItem[];
  isLoading?: boolean;
}

const FAQ: React.FC<FAQProps> = ({ faqItems, isLoading }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (isLoading) {
    return <FAQSkeleton />;
  }

  return (
    <section id="faq" className="py-20 bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-400">
            Everything you need to know about Substrate Platform.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={cn(
                  "border rounded-xl overflow-hidden transition-colors",
                  isOpen ? "border-slate-700 bg-slate-900/50" : "border-slate-800 bg-slate-900/30"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-medium text-white pr-4">{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-400 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ onLogin: () => void; onSignup: () => void }> = ({ onLogin, onSignup }) => (
  <footer className="py-12 bg-slate-900 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Substrate</span>
          </div>
          <p className="text-slate-400 max-w-sm mb-4">
            Governance layer for the AI-generated era. Restore architectural control 
            and visibility over your codebase.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-2">
            <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
            <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Changelog</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Roadmap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Resources</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Substrate Platform. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-slate-500 hover:text-slate-400 transition-colors">Privacy</a>
          <a href="#" className="text-slate-500 hover:text-slate-400 transition-colors">Terms</a>
          <a href="#" className="text-slate-500 hover:text-slate-400 transition-colors">Security</a>
        </div>
      </div>
    </div>
  </footer>
);

// ============================================================================
// Data Transformation Helpers
// ============================================================================

function mapFeaturesFromApi(apiFeatures: Array<{ id: string; title: string; description: string; icon: string }>): Feature[] {
  return apiFeatures.map((feature) => ({
    icon: ICON_MAP[feature.icon] || Shield,
    title: feature.title,
    description: feature.description,
  }));
}

function mapPricingFromApi(apiPricing: Array<{
  id: string;
  name: string;
  description: string;
  price: number | null;
  priceUnit: string | null;
  popular: boolean;
  features: string[];
  cta: { text: string; href: string; variant: 'primary' | 'secondary' };
}>): PricingTier[] {
  return apiPricing.map((tier) => ({
    name: tier.name,
    price: tier.price === null ? 'Custom' : `$${tier.price}`,
    period: tier.priceUnit || 'contact us',
    description: tier.description,
    features: tier.features,
    cta: tier.cta.text,
    popular: tier.popular,
  }));
}

function mapFAQFromApi(apiFAQ: Array<{ question: string; answer: string }>): FAQItem[] {
  return apiFAQ.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));
}

// ============================================================================
// Main Landing Component
// ============================================================================

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onSignup }) => {
  const { data: landingContent, isLoading } = useLandingContent();

  // Transform API data to component format
  const features = landingContent?.features 
    ? mapFeaturesFromApi(landingContent.features)
    : [];
  
  const pricingTiers = landingContent?.pricingTiers
    ? mapPricingFromApi(landingContent.pricingTiers)
    : [];
  
  const faqItems = landingContent?.faq
    ? mapFAQFromApi(landingContent.faq)
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <main>
        <Hero 
          onGetStarted={onSignup} 
          trustBadges={landingContent?.trustBadges}
          isLoading={isLoading}
        />
        <Features features={features} isLoading={isLoading} />
        <Pricing 
          pricingTiers={pricingTiers} 
          onSelectPlan={(plan) => onSignup()}
          isLoading={isLoading}
        />
        <FAQ faqItems={faqItems} isLoading={isLoading} />
      </main>
      <Footer onLogin={onLogin} onSignup={onSignup} />
    </div>
  );
};

export default Landing;
