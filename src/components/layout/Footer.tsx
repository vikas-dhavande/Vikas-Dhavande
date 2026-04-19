"use client";

import Link from "next/link";
import { DIcons } from "dicons";
import FooterToggle from "../ui/footer-toggle";

const navigation = {
  categories: [
    {
      id: "women",
      name: "Women",
      sections: [
        {
          id: "about",
          name: "About",
          items: [
            { name: "About", href: "/about" },
            { name: "Works", href: "/agency/works" },
            { name: "Pricing", href: "/pricing" },
          ],
        },
        {
          id: "features",
          name: "Features",
          items: [
            { name: "Products", href: "/products" },
            { name: "Agency", href: "/agency" },
            { name: "Dashboard", href: "/dashboard" },
          ],
        },
        {
          id: "products",
          name: "Products",
          items: [
            { name: "DIcons", href: "/products/dicons" },
            { name: "DShapes", href: "/products/dshapes" },
            { name: "Graaadients", href: "/products/graaadients" },
          ],
        },
        {
          id: "designs",
          name: "Designs",
          items: [
            { name: "Design", href: "/designs" },
            { name: "Components", href: "/components" },
            { name: "Blogs", href: "/blogs" },
          ],
        },
        {
          id: "other",
          name: "Others",
          items: [
            { name: "Graphic", href: "/graphic" },
            { name: "3D Icons", href: "/products/3dicons" },
            { name: "Colors", href: "/products/colors/generate" },
          ],
        },
        {
          id: "company",
          name: "Company",
          items: [
            { name: "Contact", href: "/contact" },
            { name: "Terms", href: "/terms" },
            { name: "Privacy", href: "/privacy" },
          ],
        },
      ],
    },
  ],
};

const Underline = `hover:-translate-y-1 border border-dotted rounded-xl p-2.5 transition-transform inline-flex items-center justify-center`;

export default function Footer() {
  return (
    <footer className="border-ali/20 mx-auto w-full border-b border-t px-2 mt-auto">
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex ">
        <Link href="/">
          <div className="flex items-center justify-center rounded-full">
            <span className="w-8 text-red-600">
              <DIcons.Designali />
            </span>
          </div>
        </Link>
        <p className="bg-transparent text-center text-xs leading-4 text-primary/60 md:text-left">
          Welcome to Designali, where creativity meets strategy to bring your
          vision to life. I am passionate about transforming ideas into
          compelling visual experiences. I specialize in crafting unique brand
          identities, immersive digital experiences, and engaging content that
          resonates with your audience. My mission is to empower businesses and
          brands to stand out in a crowded market. I believe in the power of
          design to tell stories, evoke emotions, and drive meaningful
          connections. I believe in quality, not quantity. Designali is actually
          an agency of one. This means you'll work directly with me, founder of
          Designali.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-dotted border-border/40"> </div>
        <div className="py-10">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-2 sm:grid-cols-3 md:flex flex-row justify-between gap-6 leading-6"
            >
              {category.sections.map((section) => (
                <div key={section.id}>
                  <ul className="flex flex-col space-y-2">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-slate-600 hover:text-black dark:text-slate-400 hover:dark:text-white md:text-xs transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-dotted border-border/40"> </div>
      </div>

      <div className="flex flex-wrap justify-center gap-y-6 items-center px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-4">
          <a
            aria-label="Mail"
            href="mailto:contact@designali.in"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Mail strokeWidth={1.5} className="h-5 w-5" />
          </a>
          <a
            aria-label="X"
            href="https://x.com/designali_in"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.X className="h-5 w-5" />
          </a>
          <a
            aria-label="Instagram"
            href="https://www.instagram.com/designali.in/"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Instagram className="h-5 w-5" />
          </a>
          <a
            aria-label="Threads"
            href="https://www.threads.net/designali.in"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Threads className="h-5 w-5" />
          </a>
          <a
            aria-label="WhatsApp"
            href="https://chat.whatsapp.com/LWsNPcz5BlWDVOha41vzuh"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.WhatsApp className="h-5 w-5" />
          </a>
          <a
            aria-label="Behance"
            href="https://www.behance.net/designali-in"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Behance className="h-5 w-5" />
          </a>
          <a
            aria-label="Facebook"
            href="https://www.facebook.com/designali.agency"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.Facebook className="h-5 w-5" />
          </a>
          <a
            aria-label="LinkedIn"
            href="https://www.linkedin.com/company/designali"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.LinkedIn className="h-5 w-5" />
          </a>
          <a
            aria-label="YouTube"
            href="https://www.youtube.com/@designali-in"
            rel="noopener noreferrer"
            target="_blank"
            className={Underline}
          >
            <DIcons.YouTube className="h-5 w-5" />
          </a>
        </div>
        <div className="w-full md:w-auto flex justify-center py-4 md:py-0 md:ml-6">
           <FooterToggle />
        </div>
      </div>

      <div className="mx-auto mb-10 mt-10 flex flex-col justify-between text-center text-xs md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
          <span> © </span>
          <span>{new Date().getFullYear()}</span>
          <span>Made with</span>
          <span className="text-red-600 mx-1 h-4 w-4 animate-pulse fill-red-600">
            <DIcons.Heart />
          </span>
          <span> by </span>
          <span className="hover:text-primary cursor-pointer text-black dark:text-white">
            <a
              aria-label="Author"
              className="font-bold underline underline-offset-4"
              href="https://www.instagram.com/aliimam.in/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ali Imam
            </a>
          </span>
          <span className="mx-2">-</span>
          <span className="hover:text-primary cursor-pointer text-slate-600 dark:text-slate-400">
            <Link href="/">
              Designali
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
