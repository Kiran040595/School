const Footer = () => (
  <footer className="bg-primary text-primary-foreground py-10">
    <div className="container text-center">
      <p className="font-heading text-lg font-semibold">Bright Future Academy</p>
      <p className="text-sm text-primary-foreground/70 mt-2">
        © {new Date().getFullYear()} Bright Future Academy. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
