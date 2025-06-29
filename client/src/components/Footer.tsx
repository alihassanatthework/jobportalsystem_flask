import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, Briefcase } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Briefcase className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold">JobConnect</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting talented professionals with their dream careers. Find the perfect job or the perfect candidate with our innovative job portal.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/alihassan._.804?igsh=MWVuZGppNW1wZmVpYw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/alihassan-developer" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link></li>
              <li><Link href="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
              <li><Link href="/applications" className="hover:text-primary transition-colors">My Applications</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Career Advice</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Salary Calculator</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Post a Job</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Browse Candidates</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Hiring Solutions</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Recruitment Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 text-primary/60" />
                <span>f2022065242@umt.edu.pk</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 mt-0.5 text-primary/60" />
                <span>03106831523</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary/60" />
                <span>Johar Town<br />Lahore, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} JobConnect. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
