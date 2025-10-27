import { useState } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("John Student");
  const [email, setEmail] = useState("john.student@university.edu");
  const [school, setSchool] = useState("University of California");
  const [country, setCountry] = useState("India");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <NavBar>
      <div className="p-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-8"
        >
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <Avatar className="w-24 h-24 border-4 border-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold text-2xl">
                JS
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-heading text-xl font-semibold mb-1">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                F-1 Visa Student
              </p>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School/University</Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Home Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                />
              </div>
            </div>

            {/* Subscription Info */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-1">
                    Premium Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Active since January 2024
                  </p>
                </div>
                <Button variant="outline">Upgrade</Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </NavBar>
  );
};

export default Profile;
