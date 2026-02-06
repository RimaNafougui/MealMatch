"use client";
import { Button, Link } from "@heroui/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";

export const SignInButtonGoogle = ({
  isSignup = false,
}: {
  isSignup?: boolean;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (isSignup) {
      sessionStorage.setItem("oauth_provider", "google");
      sessionStorage.setItem("oauth_signup_flow", "true");
    }
    router.push("/api/auth/signin/google");
  };

  return (
    <Button
      variant="bordered"
      className="w-full font-medium"
      startContent={<FaGoogle />}
      onPress={handleClick}
    >
      Google
    </Button>
  );
};

export const SignInButtonGithub = ({
  isSignup = false,
}: {
  isSignup?: boolean;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (isSignup) {
      sessionStorage.setItem("oauth_provider", "github");
      sessionStorage.setItem("oauth_signup_flow", "true");
    }
    router.push("/api/auth/signin/github");
  };

  return (
    <Button
      variant="bordered"
      className="w-full font-medium"
      startContent={<FaGithub />}
      onPress={handleClick}
    >
      GitHub
    </Button>
  );
};

export const SignOutButton = () => {
  return (
    <Link className="text-red-600" onPress={() => logout()}>
      Déconnection
    </Link>
  );
};
