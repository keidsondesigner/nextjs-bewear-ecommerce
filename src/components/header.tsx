"use client";

import { MenuIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-5">
      <div>
        <Image src="/logo.png" alt="logo" width={100} height={26.14} />
      </div>
      <div className="flex items-center">
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
            </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;