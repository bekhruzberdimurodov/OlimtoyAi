import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Mail, Calendar, User } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Muvaffaqiyatli chiqildi");
      navigate('/auth');
    } catch (error) {
      toast.error("Chiqishda xatolik yuz berdi");
    }
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 glow-effect opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-ai-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="bg-card/80 border-border/50 hover:bg-card text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
          <h1 className="text-3xl font-bold ai-gradient bg-clip-text text-transparent">
            Profil
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="card-gradient border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24 border-4 border-ai-primary/20">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url} 
                    alt={user?.email || "User"} 
                  />
                  <AvatarFallback className="bg-ai-primary/10 text-ai-primary text-2xl font-bold">
                    {user?.email ? getUserInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl text-foreground">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || "Foydalanuvchi"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/30">
                  <Mail className="w-5 h-5 text-ai-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/30">
                  <User className="w-5 h-5 text-ai-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Foydalanuvchi ID</p>
                    <p className="font-medium text-foreground font-mono text-sm">{user?.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/30">
                  <Calendar className="w-5 h-5 text-ai-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ro'yxatdan o'tgan sana</p>
                    <p className="font-medium text-foreground">
                      {user?.created_at ? formatDate(user.created_at) : "Noma'lum"}
                    </p>
                  </div>
                </div>

                {user?.user_metadata?.provider && (
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/30">
                    <div className="w-5 h-5 text-ai-primary">
                      {user.user_metadata.provider === 'google' && (
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      {user.user_metadata.provider === 'apple' && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12.017 0C8.396 0 8.025.044 8.025.044c-3.223.124-6.156 2.439-6.943 5.537C.825 6.664.825 8.246.825 8.246s-.055.365-.055 2.264c0 1.898.055 2.264.055 2.264s-.17 1.582.252 2.665c.787 3.098 3.72 5.413 6.943 5.537 0 0 .371.044 3.992.044s3.992-.044 3.992-.044c3.223-.124 6.156-2.439 6.943-5.537.422-1.083.252-2.665.252-2.665s.055-.366.055-2.264c0-1.899-.055-2.264-.055-2.264s.17-1.582-.252-2.665C20.173 2.439 17.24.124 14.017.044 14.017.044 13.646 0 12.017 0zm2.78 7.979c.893.006 1.524.25 2.021.523-1.06 1.619-2.803 1.657-2.803 1.657-1.237 0-2.24-.57-2.24-.57-.827-.897-1.453-1.539-.199-2.748.99-1.02 2.338-1.355 3.221-1.862z"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kirish usuli</p>
                      <p className="font-medium text-foreground capitalize">
                        {user.user_metadata.provider === 'google' ? 'Google' : 
                         user.user_metadata.provider === 'apple' ? 'Apple' : 
                         user.user_metadata.provider}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <div className="pt-6 border-t border-border/30">
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full h-12 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 hover:border-destructive/50"
                >
                  Hisobdan chiqish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;