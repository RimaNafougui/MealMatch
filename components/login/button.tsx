"use client";
import { Button, Link } from "@heroui/react";

import { FaGithub, FaGoogle } from "react-icons/fa";

import { signIn } from "next-auth/react";

import { logout } from "@/lib/actions/auth";

export const SignInButtonGoogle = () => {
  return (
    <Button
      variant="bordered"
      className="w-full font-medium"
      startContent={<FaGoogle />}
      onPress={() => signIn("google", { callbackUrl: "/" })}
    >
      Google
    </Button>
  );
};

export const SignInButtonGithub = () => {
  return (
    <Button
      variant="bordered"
      className="w-full font-medium"
      startContent={<FaGithub />}
      onPress={() => signIn("github", { callbackUrl: "/" })}
    >
      GitHub
    </Button>
  );
};
export const SignOutButton = () => {
  return (
    <Link className="text-red-600" onPress={() => logout()}>
      Sign out
    </Link>
  );
};
