import { Star, MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-semibold">SG Bars</span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Singapore's premier guide to the finest cocktail bars, speakeasies, and award-winning establishments across the Lion City.
            </p>
            <div className="flex space-x-4">
              <div className="text-accent text-sm">
                <strong>12</strong> Asia's 50 Best Bars
              </div>
              <div className="text-accent text-sm">
                <strong>250+</strong> Premium Venues
              </div>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">All Bars</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Asia's 50 Best</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Rooftop Bars</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Speakeasies</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Wine Bars</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">New Openings</a></li>
            </ul>
          </div>

          {/* Neighborhoods */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Areas</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Marina Bay</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Clarke Quay</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Orchard Road</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Bugis</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Chinatown</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition-colors">Tanjong Pagar</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-gray-300">hello@sgbars.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-gray-300">Singapore</span>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-400 mb-3">
                  Submit your bar for consideration or updates
                </p>
                <button className="btn-gold">
                  Add Your Bar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} SG Bars. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;