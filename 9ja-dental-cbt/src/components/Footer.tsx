import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#3ab286] text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Section */}
        <div>
          <a href="#" className="text-2xl font-bold">CBT Logo</a>
          <h2 className="mt-2 text-xl font-semibold">9ja Dental CBT</h2>
          <p className="mt-2 text-sm text-gray-100">
            Learning tool created for dentists by dentists.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/home">Home</Link></li>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/leaderboard">Leaderboard</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faqs">FAQs</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/tos">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Connect</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#">Twitter</a></li>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 border-t border-white/30 pt-4 text-center text-sm">
        © 2025 9ja Dental CBT. All rights reserved.
      </div>
    </footer>
  );
}