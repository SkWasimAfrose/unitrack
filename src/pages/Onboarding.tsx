import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [acceptedResponsibility, setAcceptedResponsibility] = useState(false);

  useEffect(() => {
    // If onboarding is already done, redirect to auth
    if (localStorage.getItem("onboarding_completed") === "true") {
      navigate("/auth");
    }
  }, [navigate]);

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/auth");
  };

  const nextStep = () => setStep((prev) => prev + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 transition-colors duration-500">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center shadow-xl shadow-primary/10 transform -rotate-12">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center transform rotate-12">
                  <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight">
                UniTrack
              </h1>
              <p className="text-xl font-medium text-muted-foreground">
                Plan your day. Track your life.
              </p>
              <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto leading-relaxed">
                UniTrack helps you organize your day, tasks, and expenses in one place.
              </p>
            </div>

            <div className="pt-8">
              <Button 
                onClick={nextStep} 
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Theme Selection */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Choose your theme</h2>
              <p className="text-muted-foreground">You can change this anytime later</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                  theme === "light" 
                    ? "border-primary bg-primary/5 shadow-xl scale-105" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                  <Sun className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Light</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                  theme === "dark" 
                    ? "border-primary bg-primary/5 shadow-xl scale-105" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-100">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Dark</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                  theme === "system" 
                    ? "border-primary bg-primary/5 shadow-xl scale-105" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
                  <Monitor className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">System</span>
              </button>
            </div>

            <Button 
              onClick={nextStep} 
              className="w-full h-14 text-lg font-bold rounded-2xl mt-8"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Account Responsibility */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 mb-2">
                <ShieldAlert className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Remember your password</h2>
                <div className="text-muted-foreground leading-relaxed px-4">
                  <p className="mb-4">
                    For now, UniTrack does not support password reset or recovery.
                  </p>
                  <p className="font-medium text-foreground">
                    Please use a password you will remember and store it safely.
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setAcceptedResponsibility(!acceptedResponsibility)}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none group",
                acceptedResponsibility
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30"
              )}
            >
              <Checkbox 
                id="responsibility" 
                checked={acceptedResponsibility}
                onCheckedChange={(checked) => setAcceptedResponsibility(checked as boolean)}
                className="w-6 h-6 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <label 
                htmlFor="responsibility" 
                className="text-base font-semibold leading-none cursor-pointer flex-1"
              >
                I understand and will store my password safely.
              </label>
            </div>

            <Button 
              onClick={handleComplete} 
              disabled={!acceptedResponsibility}
              className="w-full h-14 text-lg font-bold rounded-2xl transition-all"
            >
              Continue to Sign In
            </Button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 pt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-primary" : "w-2 bg-primary/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
