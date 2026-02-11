"use client";
import {
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import NextLink from "next/link";
import { User, Utensils, Settings, LogOut } from "lucide-react";

import { logout } from "@/lib/actions/auth";

export function ProfileDropdown({ user }: { user: any }) {
  if (!user) return null;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform hover:scale-105"
          color="success"
          name={user.name || "User"}
          size="sm"
          src={user.image || "/images/Default_pfp.png"}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Actions"
        variant="flat"
        className="w-64"
      >
        <DropdownItem
          key="user-info"
          className="h-16 gap-2 opacity-100"
          textValue="Connecté en tant que"
          isReadOnly
        >
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm">Connecté en tant que</p>
            <p className="font-semibold text-success text-xs">{user.email}</p>
          </div>
        </DropdownItem>

        <DropdownItem
          key="profile"
          as={NextLink}
          href="/profile"
          startContent={<User size={16} className="text-default-500" />}
          className="gap-3"
        >
          Mon Profil
        </DropdownItem>

        <DropdownItem
          key="recipes"
          as={NextLink}
          href="/dashboard/recettes"
          startContent={<Utensils size={16} className="text-default-500" />}
          className="gap-3"
        >
          Mes Recettes
        </DropdownItem>

        <DropdownItem
          key="settings"
          as={NextLink}
          href="/settings"
          startContent={<Settings size={16} className="text-default-500" />}
          className="gap-3"
        >
          Paramètres
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger gap-3"
          startContent={<LogOut size={16} />}
          onPress={() => logout()}
        >
          Déconnexion
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
