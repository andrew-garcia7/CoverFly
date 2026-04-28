import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo3D } from "./Logo3D";
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

const social = [
  { label: "X (Twitter)", href: "https://x.com", Icon: FaXTwitter },
  { label: "GitHub", href: "https://github.com", Icon: FaGithub },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: FaLinkedin },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram }
];

const footerLinks: { to: string; label: string; external?: boolean }[] = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/help", label: "Help Center" },
  { to: "mailto:support@coverfly.local", label: "Contact", external: true }
];

function FooterLink({
  to,
  label,
  external
}: {
  to: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "group relative inline-block text-sm text-gray-300 hover:text-white transition-colors duration-300";
  const underline = (
    <span
      className="absolute left-0 bottom-0 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-pink-400 transition-all duration-300 ease-out group-hover:w-full"
      aria-hidden
    />
  );

  if (external) {
    return (
      <a href={to} className={className}>
        {label}
        {underline}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {label}
      {underline}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0B0F19] text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Logo3D variant="footer" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-300">
              Premium ride booking with smart matching, safety sharing, and realtime tracking — built for riders who
              expect more than a basic taxi app.
            </p>
            <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} CoverFly. All rights reserved.</p>
          </div>

          <div className="lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Legal & support</div>
            <nav className="mt-4 flex flex-col gap-3" aria-label="Footer links">
              {footerLinks.map((item) => (
                <FooterLink key={item.label} to={item.to} label={item.label} external={item.external} />
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Follow us</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {social.map(({ label, href, Icon }) => (
                <div key={label} className="group relative">
                  <motion.a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    whileHover={{
                      scale: 1.12,
                      rotate: [-1, 1, -1, 0],
                      transition: { type: "spring", stiffness: 400, damping: 12 }
                    }}
                    whileTap={{ scale: 0.96 }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-200 transition-shadow duration-300 hover:border-transparent hover:shadow-[0_0_22px_rgba(59,130,246,0.45),0_0_28px_rgba(236,72,153,0.35)]"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </motion.a>
                  <span
                    className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900/95 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition duration-200 group-hover:opacity-100"
                    role="tooltip"
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-center text-xs text-gray-500 sm:text-left">
            Safety, maps, and payments are continuously improved — experience may vary by city.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link to="/drivers" className="hover:text-gray-300 transition-colors">
              Drivers
            </Link>
            <Link to="/book" className="hover:text-gray-300 transition-colors">
              Book
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
