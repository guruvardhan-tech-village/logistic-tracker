import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import { Shield, Map, Activity, Moon, Sun, ArrowRight, Zap, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}>
              <img 
                src={theme === 'dark' ? logoDark : logoLight} 
                alt="CargoLink Logo" 
                className="h-10 w-auto object-contain transition-all duration-300" 
              />
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                CargoLink
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-200"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Button onClick={() => navigate('/login')} className="rounded-full px-6 shadow-lg hover:shadow-primary/25 transition-all">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4 mx-auto max-w-7xl text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Next-Generation Fleet Tracking is Live
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Smart Logistics, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-indigo-400">
              Seamless Operations.
            </span>
          </motion.h1>

          <motion.p variants={fadeIn} className="mt-4 max-w-2xl text-lg sm:text-xl text-muted-foreground mx-auto">
            Empower your fleet with CargoLink's real-time telemetry, intelligent routing, and predictive analytics. The ultimate operating system for modern logistics.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button size="lg" onClick={() => navigate('/login')} className="rounded-full h-14 px-8 text-lg font-medium group">
              Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg font-medium bg-background/50 backdrop-blur-sm border-border hover:bg-accent">
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left"
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="relative p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
              <div className={`p-4 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-inner`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} CargoLink Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Real-Time Tracking",
    description: "Monitor your entire fleet with sub-second latency using advanced MQTT telemetry and WebSocket integration.",
    icon: Map,
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Intelligent Telemetry",
    description: "Gain deep insights into fuel consumption, engine health, and driver behavior with predictive analytics.",
    icon: Activity,
    color: "from-emerald-400 to-teal-500"
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade JWT authentication, role-based access control, and end-to-end encryption for your fleet data.",
    icon: Shield,
    color: "from-violet-500 to-purple-600"
  },
  {
    title: "Instant Alerts",
    description: "Receive immediate notifications for critical events, geofence breaches, and maintenance requirements.",
    icon: Zap,
    color: "from-amber-400 to-orange-500"
  },
  {
    title: "Multi-Role Portals",
    description: "Dedicated dashboards for Administrators, Drivers, and Customers tailored to their specific workflows.",
    icon: Truck,
    color: "from-rose-400 to-red-500"
  }
];
