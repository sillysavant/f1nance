import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Login from "@/components/Login";
import Register from "@/components/Register";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [nationality, setNationality] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isLogin ? "Welcome back!" : "Account created!",
      description: isLogin
        ? "You've successfully logged in."
        : "Your account has been created.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-heading font-bold text-2xl">
                F1
              </div>
              <span className="font-heading font-bold text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                F1nance
              </span>
            </div>

            <h1 className="font-heading text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Master your money,
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                own your future
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md">
              Join thousands of F-1 students who are taking control of their
              finances in the U.S. with intelligent budgeting and visa-aware
              guidance.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center overflow-auto justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>

          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold mb-2">
              {isLogin ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to your F1nance account"
                : "Create your free F1nance account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              <Login
                email={email}
                password={password}
                setEmail={setEmail}
                setPassword={setPassword}
              />
            ) : (
              <Register
                email={email}
                name={name}
                password={password}
                confirmPassword={confirmPassword}
                school={school}
                nationality={nationality}
                setEmail={setEmail}
                setName={setName}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                setSchool={setSchool}
                setNationality={setNationality}
              />
            )}
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
