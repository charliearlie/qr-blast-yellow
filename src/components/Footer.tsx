import { Github, Twitter, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase tracking-tight">
              <span className="text-primary">BLAST QR</span>
            </h3>
            <p className="text-gray-300 font-medium">
              Create intelligent, dynamic QR codes that adapt to your needs.
              Free, secure, and powerful.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-tight">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#generator"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Generator
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-tight">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-tight">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacy"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/cookies"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="/gdpr"
                  className="text-gray-300 hover:text-primary transition-colors font-medium"
                >
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 font-medium">
              © {currentYear} Blast QR. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 mt-4 md:mt-0"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
