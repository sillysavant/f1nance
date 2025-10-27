import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface RegisterProps {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  school: string;
  nationality: string;
  setEmail: (value: string) => void;
  setName: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setSchool: (value: string) => void;
  setNationality: (value: string) => void;
}

const Register = ({
  email,
  name,
  password,
  confirmPassword,
  school,
  nationality,
  setEmail,
  setName,
  setPassword,
  setConfirmPassword,
  setSchool,
  setNationality,
}: RegisterProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          type="text"
          placeholder="Your School"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          required
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nationality">Nationality</Label>
        <Input
          id="nationality"
          type="text"
          placeholder="Your Nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          required
          className="bg-card border-border focus:border-primary"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold shadow-neon"
        size="lg"
      >
        Create Account
      </Button>
    </>
  );
};

export default Register;
