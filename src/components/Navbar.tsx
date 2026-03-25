import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Toppers", href: "#toppers" },
  { label: "Gallery", href: "#gallery" },
  { label: "Syllabus", href: "#syllabus" },
  { label: "Notices", href: "#announcements" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const renderLink = (l: { label: string; href: string }) => {
    // Hash links: if on homepage use hash, otherwise navigate to /#hash
    const target = isHome ? l.href : `/${l.href}`;
    return (
      <a href={target} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        {l.label}
      </a>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={schoolLogo} alt="School logo" className="h-10 w-10" />
          <span className="text-xl font-heading font-bold text-primary">Bright Future Academy</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-8">
            {navLinks.map((l) => (
              <li key={l.href}>{renderLink(l)}</li>
            ))}
            <li>
              <Link to="/student-data" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-b">
          <ul className="container py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <li key={l.href} onClick={() => setOpen(false)}>
                {renderLink(l)}
              </li>
            ))}
            <li onClick={() => setOpen(false)}>
              <Link to="/student-data" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
