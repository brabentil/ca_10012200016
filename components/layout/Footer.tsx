'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Heart,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press Kit', href: '/press' },
    ],
    customer: [
      { label: 'Help Center', href: '/help' },
      { label: 'Shipping & Delivery', href: '/shipping' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'FAQs', href: '/faq' },
    ],
    shop: [
      { label: "Women's Fashion", href: '/products?category=women' },
      { label: "Men's Fashion", href: '/products?category=men' },
      { label: 'Accessories', href: '/products?category=accessories' },
      { label: 'New Arrivals', href: '/products?sort=newest' },
      { label: 'Sale Items', href: '/products?on_sale=true' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Student Verification', href: '/verification-policy' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/thrifthub', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/thrifthub', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/thrifthub', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/thrifthub', label: 'LinkedIn' },
  ];

  const features = [
    { icon: Shield, text: 'Secure Payments' },
    { icon: Truck, text: 'Campus Delivery' },
    { icon: CreditCard, text: 'Payday Flex' },
    { icon: Heart, text: 'Quality Verified' },
  ];

  return (
    <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white">
      {/* Features Bar */}
      <div className="border-b border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-secondary-400" />
                </div>
                <span className="text-sm font-medium text-primary-100">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">ThriftHub</h3>
                  <p className="text-xs text-primary-200 font-medium">Sustainable Campus Fashion</p>
                </div>
              </Link>
              <p className="text-primary-200 text-sm leading-relaxed mb-6">
                Your campus premier thrift marketplace. Quality fashion, unbeatable prices, delivered to your dorm. Join 500+ students shopping sustainably.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a href="tel:+233123456789" className="flex items-center gap-3 text-primary-200 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-primary-700/50 rounded-lg flex items-center justify-center group-hover:bg-secondary-500/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">+233 123 456 789</span>
                </a>
                <a href="mailto:hello@thrifthub.com" className="flex items-center gap-3 text-primary-200 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-primary-700/50 rounded-lg flex items-center justify-center group-hover:bg-secondary-500/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">hello@thrifthub.com</span>
                </a>
                <div className="flex items-center gap-3 text-primary-200">
                  <div className="w-8 h-8 bg-primary-700/50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm">University Campus, Ghana</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-200 hover:text-secondary-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Service Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-200 hover:text-secondary-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-200 hover:text-secondary-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-200 hover:text-secondary-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-primary-700/50"
        >
          <div className="max-w-2xl">
            <h4 className="text-white font-bold text-lg mb-2">Stay Updated</h4>
            <p className="text-primary-200 text-sm mb-4">
              Subscribe to our newsletter for exclusive deals, new arrivals, and sustainable fashion tips.
            </p>
            <form className="flex gap-2 flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 bg-primary-700/30 border border-primary-600/50 rounded-lg text-white placeholder:text-primary-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="h-11 px-6 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold rounded-lg shadow-lg shadow-secondary-500/20 hover:shadow-xl hover:shadow-secondary-600/30 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-primary-300 text-sm">
              © {currentYear} ThriftHub. All rights reserved. Made with{' '}
              <Heart className="inline w-4 h-4 text-red-500 fill-red-500" /> for students.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-primary-700/50 hover:bg-secondary-500/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-primary-200 group-hover:text-secondary-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-primary-700/50">
            <p className="text-primary-300 text-xs text-center mb-3">Accepted Payment Methods</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
              <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-800">Visa</div>
              <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-800">Mastercard</div>
              <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-800">MTN Mobile Money</div>
              <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-800">Vodafone Cash</div>
              <div className="bg-secondary-500 rounded px-3 py-2 text-xs font-semibold text-white">Payday Flex</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
