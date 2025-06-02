import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import React, { useState } from "react";
import DashboardPage from "./DashboardPage";
import GoalsPage from "./GoalsPage";
import TransactionsPage from "./TransactionsPage";
import BudgetsPage from "./BudgetsPage";
import FinancialStrategiesPage from "./FinancialStrategiesPage";

type Page = "dashboard" | "goals" | "transactions" | "budgets" | "strategies";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b border-border shadow-sm px-4 md:px-8">
        <h2 className="text-xl font-semibold text-primary">Path2Plan</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex flex-col md:flex-row">
        <Authenticated>
          <AppContent />
        </Authenticated>
        <Unauthenticated>
          <TitlePage />
        </Unauthenticated>
      </main>
      <Toaster richColors />
    </div>
  );
}

function TitlePage() {
  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary/30 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-accent/40 rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-secondary/50 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-primary/20 rounded-full animate-bounce-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-full p-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Hero Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 animate-fade-in">
                    ✨ Your Financial Journey Starts Here
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Path2Plan
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-secondary/80 leading-relaxed animate-fade-in-up-delay-1">
                  Transform your financial future with intelligent planning, 
                  <span className="text-primary font-semibold"> AI-powered insights</span>, 
                  and beautiful goal tracking.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up-delay-2">
                  <div className="flex items-center space-x-2 text-secondary/70">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Smart Budgeting</span>
                  </div>
                  <div className="flex items-center space-x-2 text-secondary/70">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <span className="text-sm font-medium">Goal Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2 text-secondary/70">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <span className="text-sm font-medium">AI Advisor</span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up-delay-3">
                <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">💰</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-1">Smart Tracking</h3>
                  <p className="text-xs text-secondary/70">Monitor every dollar</p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.1s' }}>
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🎯</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-1">Goal Setting</h3>
                  <p className="text-xs text-secondary/70">Achieve your dreams</p>
                </div>
                
                <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.2s' }}>
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🤖</span>
                  </div>
                  <h3 className="font-semibold text-primary mb-1">AI Insights</h3>
                  <p className="text-xs text-secondary/70">Personalized advice</p>
                </div>
              </div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="flex justify-center lg:justify-end animate-fade-in-right">
              <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10 hover:shadow-3xl transition-all duration-500 hover:bg-white/95">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-xl animate-glow">
                      <span className="text-white text-3xl font-bold">P2P</span>
                    </div>
                    <h2 className="text-3xl font-bold text-primary mb-3">Welcome Back!</h2>
                    <p className="text-secondary/70 text-lg">Sign in to continue your financial journey</p>
                  </div>
                  
                  <div className="space-y-6">
                    <SignInForm />
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200/50">
                    <div className="text-center">
                      <p className="text-sm text-secondary/60 mb-4">Trusted by students worldwide</p>
                      <div className="flex justify-center space-x-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
                        ))}
                      </div>
                      <p className="text-xs text-secondary/50">Start your financial success story today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex-1 flex justify-center items-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary/70">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }
  
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "goals":
        return <GoalsPage />;
      case "transactions":
        return <TransactionsPage />;
      case "budgets":
        return <BudgetsPage />;
      case "strategies":
        return <FinancialStrategiesPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <React.Fragment>
      <nav className="w-full md:w-64 bg-white border-r border-border p-4 flex flex-col md:h-screen md:sticky md:top-16">
        <div className="space-y-2 flex-grow">
          <button 
            onClick={() => setActivePage("dashboard")}
            className={`w-full text-left px-4 py-2 rounded hover:bg-primary/10 transition-all duration-200 ${activePage === "dashboard" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setActivePage("goals")}
            className={`w-full text-left px-4 py-2 rounded hover:bg-primary/10 transition-all duration-200 ${activePage === "goals" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}
          >
            🎯 Goals
          </button>
          <button 
            onClick={() => setActivePage("transactions")}
            className={`w-full text-left px-4 py-2 rounded hover:bg-primary/10 transition-all duration-200 ${activePage === "transactions" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}
          >
            💳 Transactions
          </button>
          <button 
            onClick={() => setActivePage("budgets")}
            className={`w-full text-left px-4 py-2 rounded hover:bg-primary/10 transition-all duration-200 ${activePage === "budgets" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}
          >
            💰 Budgets
          </button>
          <button 
            onClick={() => setActivePage("strategies")}
            className={`w-full text-left px-4 py-2 rounded hover:bg-primary/10 transition-all duration-200 ${activePage === "strategies" ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-primary"}`}
          >
            🤖 AI Advisor
          </button>
        </div>
        {loggedInUser ? (
          <div className="mt-auto pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground truncate" title={loggedInUser.name ?? "User"}>
              {loggedInUser.name ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate" title={loggedInUser.email ?? ""}>
              {loggedInUser.email ?? "No email"}
            </p>
          </div>
        ) : null}
      </nav>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-background">
        {renderPage()}
      </div>
    </React.Fragment>
  );
}
