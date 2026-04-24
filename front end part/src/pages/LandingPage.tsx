import { Link } from 'react-router-dom';
import { Heart, Brain, Shield, Activity, ChevronRight, Stethoscope, BarChart3, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
    <div className="container flex h-16 items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <Heart className="h-7 w-7 text-primary" fill="currentColor" />
        <span className="text-xl font-bold text-foreground">MediPredict</span>
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
        <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link to="/login"><Button variant="outline" size="sm">Log In</Button></Link>
        <Link to="/signup"><Button size="sm">Sign Up</Button></Link>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
    <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-success/5 blur-3xl" />
    <div className="container relative">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6 animate-fade-in">
          <Activity className="h-4 w-4" /> AI-Powered Health Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 animate-fade-in-up">
          Predict. Understand. <span className="text-primary">Prevent.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Advanced multi-disease prediction powered by machine learning. Get risk assessments, explainable AI insights, and personalized health recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/signup">
            <Button size="lg" className="px-8 text-base gap-2">
              Get Started <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline" className="px-8 text-base">Learn More</Button>
          </a>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        {['Diabetes', 'Heart Disease', 'Kidney Disease', 'Liver Disease'].map((d, i) => (
          <div key={d} className="rounded-xl border border-border bg-card p-4 text-center shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
            <div className="flex justify-center mb-2">
              <img src={['/icons/diabetes.png', '/icons/heart.png', '/icons/kidney.png', '/icons/liver.png'][i]} alt={d} className="w-8 h-8 object-contain" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const features = [
  { icon: Stethoscope, title: 'Multi-Disease Prediction', desc: 'Predict risk for Diabetes, Heart Disease, Kidney Disease, and Liver Disease simultaneously.' },
  { icon: Brain, title: 'AI-Powered Explanations', desc: 'Understand which factors contribute most to your risk using Explainable AI (SHAP).' },
  { icon: BarChart3, title: 'Detailed Risk Analysis', desc: 'Visualize your risk with interactive charts, bar graphs, and detailed breakdowns.' },
  { icon: Lightbulb, title: 'Personalized Suggestions', desc: 'Receive AI-generated health recommendations tailored to your specific parameters.' },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 bg-card">
    <div className="container">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">Everything you need for comprehensive health risk assessment and prevention guidance.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={f.title} className="group rounded-xl border border-border bg-background p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const steps = [
  { num: '01', title: 'Fill Medical Form', desc: 'Enter your medical parameters in our intuitive, guided form.' },
  { num: '02', title: 'AI Prediction', desc: 'Our ML models analyze your data and compute disease risk scores.' },
  { num: '03', title: 'View Results & Insights', desc: 'Get detailed risk analysis, explanations, and personalized suggestions.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20">
    <div className="container">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to get your comprehensive health risk assessment.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <span className="text-xl font-bold text-primary">{s.num}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
            {i < 2 && <div className="hidden md:block mt-6 text-primary text-2xl">→</div>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="font-bold text-foreground">MediPredict</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">AI-powered disease prediction platform. Not a substitute for professional medical advice.</p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MediPredict. All rights reserved.
      </div>
    </div>
  </footer>
);

const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <HowItWorks />
    <section id="about" className="py-20 bg-card">
      <div className="container max-w-3xl text-center">
        <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-foreground mb-4">Your Data, Your Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">
          MediPredict is designed with privacy at its core. Your medical data is processed securely and never shared with third parties.
          Our AI predictions are meant to supplement — never replace — professional medical consultation.
        </p>
      </div>
    </section>
    <Footer />
  </div>
);

export default LandingPage;
