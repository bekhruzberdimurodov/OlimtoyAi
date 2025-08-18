import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Google orqali kirish amalga oshmadi: ' + error.message);
      setLoading(null);
    }
  };

  const signInWithApple = async () => {
    setLoading('apple');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error('Apple orqali kirish amalga oshmadi: ' + error.message);
      setLoading(null);
    }
  };

  // Note: Telegram auth needs special setup with Telegram Bot API
  const signInWithTelegram = async () => {
    toast.info('Telegram auth tez orada qo\'shiladi');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 glow-effect opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-ai-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 ai-gradient bg-clip-text text-transparent">
            Olimtoy AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Platformaga kirish uchun tizimga kiring
          </p>
        </div>

        {/* Auth Card */}
        <div className="card-gradient rounded-2xl p-8 border border-border/50 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Google Login */}
            <Button
              onClick={signInWithGoogle}
              disabled={loading !== null}
              className="w-full h-12 bg-card hover:bg-card/80 border border-border/50 text-foreground hover:text-foreground/90 transition-all duration-200 hover:shadow-lg hover:shadow-ai-primary/10"
              variant="outline"
            >
              {loading === 'google' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-ai-primary border-t-transparent"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google orqali kirish
                </>
              )}
            </Button>

            {/* Apple Login */}
            <Button
              onClick={signInWithApple}
              disabled={loading !== null}
              className="w-full h-12 bg-card hover:bg-card/80 border border-border/50 text-foreground hover:text-foreground/90 transition-all duration-200 hover:shadow-lg hover:shadow-ai-primary/10"
              variant="outline"
            >
              {loading === 'apple' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-ai-primary border-t-transparent"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C8.396 0 8.025.044 8.025.044c-3.223.124-6.156 2.439-6.943 5.537C.825 6.664.825 8.246.825 8.246s-.055.365-.055 2.264c0 1.898.055 2.264.055 2.264s-.17 1.582.252 2.665c.787 3.098 3.72 5.413 6.943 5.537 0 0 .371.044 3.992.044s3.992-.044 3.992-.044c3.223-.124 6.156-2.439 6.943-5.537.422-1.083.252-2.665.252-2.665s.055-.366.055-2.264c0-1.899-.055-2.264-.055-2.264s.17-1.582-.252-2.665C20.173 2.439 17.24.124 14.017.044 14.017.044 13.646 0 12.017 0zm2.78 7.979c.893.006 1.524.25 2.021.523-1.06 1.619-2.803 1.657-2.803 1.657-1.237 0-2.24-.57-2.24-.57-.827-.897-1.453-1.539-.199-2.748.99-1.02 2.338-1.355 3.221-1.862z"/>
                  </svg>
                  Apple orqali kirish
                </>
              )}
            </Button>

            {/* Telegram Login */}
            <Button
              onClick={signInWithTelegram}
              disabled={loading !== null}
              className="w-full h-12 bg-card hover:bg-card/80 border border-border/50 text-foreground hover:text-foreground/90 transition-all duration-200 hover:shadow-lg hover:shadow-ai-primary/10"
              variant="outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.18 1.896-.962 6.502-1.359 8.627-.168.9-.499 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram orqali kirish
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Kirish orqali siz{" "}
              <span className="text-ai-primary cursor-pointer hover:underline">
                foydalanish shartlari
              </span>{" "}
              va{" "}
              <span className="text-ai-primary cursor-pointer hover:underline">
                maxfiylik siyosati
              </span>
              ga rozilik bildirgan bo'lasiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;