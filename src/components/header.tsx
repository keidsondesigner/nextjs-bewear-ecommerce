"use client";

import { LogInIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Cart from "./cart";
import { useQueryClient } from "@tanstack/react-query";

const Header = () => {
  //Renomeando data para session
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  return (
    <header className="max-w-[1280px] mx-auto p-5 flex items-center justify-between">
        <Link href="/">
            <Image
              className="w-fit h-auto"
              src="/logo.png"
              alt="logo"
              width={0}
              height={0}
              sizes="100vw"
            />
        </Link>
      <div className="flex items-center gap-5">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-5">
              {session?.user ? (
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarImage
                            src={session?.user?.image as string | undefined}
                        />
                        <AvatarFallback>
                            {session.user.name?.charAt(0)}
                        </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                        <h3 className="font-semibold">{session.user.name}</h3>
                        <span className="block text-muted-foreground text-xs">
                            {session.user.email}
                        </span>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Sair
                    </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Olá, faça login para continuar.
                  </h3>
                  <Button asChild size="icon" variant="outline">
                    <Link href="/auth">
                      <LogInIcon />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Cart />
      </div>
    </header>
  );
};

export default Header;