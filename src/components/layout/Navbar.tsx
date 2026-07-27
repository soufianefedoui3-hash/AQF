"use client";



import { useState, useEffect } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";

import { NAV_LINKS } from "@/lib/constants";

import { Button } from "@/components/ui/Button";

import { Logo } from "@/components/brand/Logo";

import { cn } from "@/lib/utils";

import { ConsultationModal } from "@/components/forms/ConsultationModal";



export function Navbar() {

  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [consultOpen, setConsultOpen] = useState(false);



  useEffect(() => {

    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);



  useEffect(() => {

    setIsOpen(false);

  }, [pathname]);



  return (

    <>

      <header

        className={cn(

          "fixed top-0 right-0 left-0 z-50 h-16 transition-all duration-300",

          scrolled

            ? "border-b border-primary-100 bg-white/95 shadow-md backdrop-blur-md"

            : "bg-white/90 backdrop-blur-sm"

        )}

      >

        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <div className="flex shrink-0 items-center">

            <Logo variant="navbar" priority />

          </div>



          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">

            {NAV_LINKS.map((link) => {

              const active = pathname === link.href;

              return (

                <Link

                  key={link.href}

                  href={link.href}

                  className={cn(

                    "rounded-lg px-3 py-2 text-sm font-medium transition",

                    active

                      ? "bg-accent-50 text-primary-900 ring-1 ring-accent-200"

                      : "text-text-muted hover:bg-accent-50 hover:text-primary-900"

                  )}

                >

                  {link.label}

                </Link>

              );

            })}

          </div>



          <div className="hidden shrink-0 lg:block">

            <Button variant="secondary" size="sm" onClick={() => setConsultOpen(true)}>

              Demander une consultation

            </Button>

          </div>



          <button

            className="shrink-0 rounded-lg p-2 text-primary-800 lg:hidden"

            onClick={() => setIsOpen(!isOpen)}

            aria-label="Menu"

            aria-expanded={isOpen}

          >

            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}

          </button>

        </nav>



        {isOpen && (

          <div className="border-t border-primary-100 bg-white px-4 py-4 lg:hidden">

            <div className="flex flex-col gap-1">

              {NAV_LINKS.map((link) => (

                <Link

                  key={link.href}

                  href={link.href}

                  className="rounded-lg px-4 py-3 text-sm font-medium text-text-muted hover:bg-accent-50 hover:text-primary-900"

                >

                  {link.label}

                </Link>

              ))}

              <Button

                variant="secondary"

                size="sm"

                className="mt-2"

                onClick={() => {

                  setIsOpen(false);

                  setConsultOpen(true);

                }}

              >

                Demander une consultation

              </Button>

            </div>

          </div>

        )}

      </header>



      {/* Spacer for fixed header — mobile menu expands below header without shifting layout */}

      <div className="h-16 shrink-0" aria-hidden />



      <ConsultationModal isOpen={consultOpen} onClose={() => setConsultOpen(false)} />

    </>

  );

}

