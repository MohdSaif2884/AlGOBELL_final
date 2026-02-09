import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with contest reminders.",
    features: [
      "Web Push notifications",
      "Email alerts",
      "1 platform (Codeforces)",
      "30 min & 10 min reminders",
      "Basic dashboard",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$2",
    period: "/month",
    description: "For serious competitive programmers who want it all.",
    features: [
      "Everything in Free",
      "WhatsApp message alerts 📱",
      "All 5 platforms",
      "Custom reminder offsets",
      "In-App alarm sounds",
      "Smart recommendations",
      "Sleep hours filter",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    featured: true,
  },
];

const Pricing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upgrade to Pro.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Pro Activated Successfully",
          description: "Welcome to Pro! Enjoy all premium features.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Upgrade Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="pricing" className="relative py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-primary font-medium uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`pricing-card ${plan.featured ? "featured" : ""}`}
            >
              {/* Featured Badge */}
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="relative z-10">
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-success" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.featured ? (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handleUpgrade}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <Link to="/dashboard">
                    <Button
                      variant="glass"
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Link */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Have questions?{" "}
          <a href="#" className="text-primary hover:underline">
            Check our FAQ
          </a>{" "}
          or{" "}
          <a href="#" className="text-primary hover:underline">
            contact support
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
