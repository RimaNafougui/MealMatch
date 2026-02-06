"use client";
import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import NextLink from "next/link";

import { logout } from "@/lib/actions/auth";

export function ProfileDropdown({ user }: { user: any }) {
  if (!user) return null;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="primary"
          name={user.name || "User"}
          size="sm"
          src={user.image || "/images/Default_pfp.png"}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem
          key="user-info"
          className="h-14 gap-2 opacity-100 italic"
          textValue="Connecté en tant que"
        >
          <p className="font-semibold">Connecté en tant que</p>
          <p className="font-semibold text-primary">{user.email}</p>
        </DropdownItem>

        <DropdownItem key="profile" as={NextLink} href="/profile">
          Mon Profile
        </DropdownItem>

        <DropdownItem key="closet" as={NextLink} href="/recipes">
          Recettes
        </DropdownItem>

        <DropdownItem key="settings" as={NextLink} href="/settings">
          Paramètres
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          onPress={() => logout()}
        >
          Déconnection
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
