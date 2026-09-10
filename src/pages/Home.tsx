import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Star,
  Sparkles,
  ArrowRight,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";

// Floating orb component - CSS animation for performance
const FloatingOrb = ({
  className,
  delayed = 0,
}: {
  className?: string;
  delayed?: number;
}) => (
  <div
    className={`absolute rounded-full blur-2xl floating-orb ${delayed === 1
        ? "floating-orb-delayed"
        : delayed === 2
          ? "floating-orb-delayed-2"
          : ""
      } ${className}`}
  />
);

// Animated counter component
const AnimatedCounter = ({
  value,
  suffix = "",
}: {
  value: string;
  suffix?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="gradient-text text-glow"
    >
      {value}
      {suffix}
    </motion.span>
  );
};

// Split text animation - each character animates separately
const SplitText = ({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) => {
  const characters = children.split("");

  return (
    <span className={className}>
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.03,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Find Your Next Collab",
      description:
        "Browse campaigns from brands looking for creators in your niche.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Target,
      title: "Simple Filtering",
      description:
        "Filter by category and budget to find relevant opportunities.",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: TrendingUp,
      title: "Keep Track",
      description:
        "Manage your applications and collaborations in one simple dashboard.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Real People Only",
      description: "We manually review accounts to keep the platform genuine.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Zap,
      title: "Direct Communication",
      description: "Connect with brands directly — no middlemen, no delays.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Heart,
      title: "Built for Micro-Creators",
      description:
        "Designed for creators starting out, not just mega-influencers.",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  // const stats = [
  //   { value: "Free", label: "To Start", icon: Users },
  //   { value: "Direct", label: "Brand Access", icon: Target },
  //   { value: "Simple", label: "Process", icon: Sparkles },
  //   { value: "Growing", label: "Community", icon: TrendingUp },
  // ];
  const stats = [
    { value: "Free", label: "To Start", sub: "No credit card", icon: Users },
    {
      value: "Direct",
      label: "Brand Access",
      sub: "No middlemen",
      icon: Target,
    },
    {
      value: "Simple",
      label: "Workflow",
      sub: "Apply → Collaborate",
      icon: Sparkles,
    },
    {
      value: "Growing",
      label: "Community",
      sub: "Early access",
      icon: TrendingUp,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description:
        "Set up your profile with your niche, audience size, and content style.",
      icon: "✨",
    },
    {
      number: "02",
      title: "Browse & Apply",
      description:
        "Explore available campaigns and apply to ones that fit your style.",
      icon: "🎯",
    },
    {
      number: "03",
      title: "Get Connected",
      description:
        "If accepted, get full brand details and start collaborating directly.",
      icon: "🚀",
    },
  ];

  return (
    <>
      <Helmet>
        <title>FameSync - Connect Creators with Brands | Early Access</title>
        <meta
          name="description"
          content="FameSync is a simple platform connecting micro-influencers with brands for authentic collaborations. Join our early access community and find your next partnership."
        />
        <meta
          name="keywords"
          content="influencer marketing, brand collaborations, micro-influencer platform, creator collaborations, influencer partnerships, FameSync"
        />
        <link rel="canonical" href="https://famesync.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://famesync.com/" />
        <meta
          property="og:title"
          content="FameSync - Connect Creators with Brands"
        />
        <meta
          property="og:description"
          content="A simple platform connecting micro-influencers with brands for authentic collaborations."
        />
        <meta property="og:image" content="https://famesync.com/og-image.png" />
        <meta property="og:site_name" content="FameSync" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://famesync.com/" />
        <meta
          name="twitter:title"
          content="FameSync - Connect Creators with Brands"
        />
        <meta
          name="twitter:description"
          content="A simple platform connecting micro-influencers with brands for authentic collaborations."
        />
        <meta
          name="twitter:image"
          content="https://famesync.com/og-image.png"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "FameSync",
            description:
              "Platform connecting micro-influencers with brands for authentic collaborations",
            url: "https://famesync.com",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated background mesh */}
          <div className="absolute inset-0 mesh-gradient opacity-60" />
          <div className="absolute inset-0 grid-pattern opacity-20" />

          {/* Floating orbs - CSS animations for performance */}
          <FloatingOrb
            className="hidden sm:block w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/15 top-0 -left-40"
            delayed={0}
          />
          <FloatingOrb
            className="hidden sm:block w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent/10 -bottom-20 -right-40"
            delayed={1}
          />
          <FloatingOrb
            className="hidden md:block w-[300px] h-[300px] bg-secondary/15 top-1/3 right-1/4"
            delayed={2}
          />

          {/* Floating social icons - CSS animations */}
          <div className="absolute top-1/4 left-[10%] hidden xl:block float-icon">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Instagram className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-[15%] hidden xl:block float-icon float-icon-delayed">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-xl">
              <Youtube className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="absolute top-1/3 right-[12%] hidden xl:block float-icon float-icon-delayed-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl">
              <Twitter className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10 pt-16 sm:pt-20 pb-20 sm:pb-32">
            <div className="text-center max-w-6xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* <Badge className="mb-4 sm:mb-8 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-0 glass-card text-foreground hover:scale-105 transition-transform cursor-default">
                  <motion.span
                    className="inline-block mr-1.5 sm:mr-2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </motion.span>
                  <span className="hidden sm:inline">Now in Early Access</span>
                  <span className="sm:hidden">Early Access</span>
                </Badge> */}
              </motion.div>

              {/* Main heading - split character animation */}
              <div className="mb-6 sm:mb-8 perspective-1000">
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter">
                  <span className="gradient-text block">
                    <SplitText delay={0.2}>Where Creators</SplitText>
                  </span>
                  <span className="block text-glow">
                    <SplitText delay={0.6}>And Brands Meets</SplitText>
                  </span>
                </h1>
              </div>

              {/* Tagline */}
              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
              >
                A simple platform connecting
                <span className="text-primary font-medium"> creators </span>
                with
                <span className="text-accent font-medium"> brands </span>
                for authentic collaborations.
              </motion.p>

              {/* Role Selection Cards */}
              <motion.div
                className="flex flex-col md:flex-row gap-4 sm:gap-6 justify-center mb-10 sm:mb-16 px-4 sm:px-0 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
              >
                {/* Creator Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex-1 group cursor-pointer"
                  onClick={() => navigate("/auth?role=influencer&mode=signup")}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 sm:p-8 hover:border-primary/40 transition-all duration-300">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon */}
                    <div className="relative mb-4 flex justify-center">
                      <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
                        <Instagram className="w-8 h-8 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        I'm a Creator
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        Find brand collaborations that match your style and audience
                      </p>
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <span>Start for free</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Brand Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex-1 group cursor-pointer"
                  onClick={() => navigate("/auth?role=brand&mode=signup")}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-background to-primary/5 p-6 sm:p-8 hover:border-accent/40 transition-all duration-300">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon */}
                    <div className="relative mb-4 flex justify-center">
                      <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-accent/30 transition-shadow">
                        <Target className="w-8 h-8 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-accent transition-colors">
                        I'm a Brand
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">
                        Connect with authentic creators to grow your brand
                      </p>
                      <div className="flex items-center gap-2 text-accent font-medium">
                        <span>Post a campaign</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>


              {/* Stats row */}
              {/* Stats wrapper */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 0.6, ease: "easeOut" }}
                className="mt-12 sm:mt-16"
              >
                {/* subtle divider */}
                <div className="h-px w-24 mx-auto mb-6 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                {/* Stats row */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 blur-xl" />

                  <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-3 sm:px-0">
                    {stats.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.label}
                          className="group rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5
                       bg-white/5 backdrop-blur-md border border-white/10
                       hover:border-primary/25 transition-all text-center"
                        >
                          {/* Icon */}
                          <div className="flex justify-center mb-2 sm:mb-3">
                            <div
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/15
                              flex items-center justify-center
                              group-hover:bg-primary/25 transition-colors"
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                          </div>

                          {/* Value */}
                          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none">
                            <AnimatedCounter value={stat.value} />
                          </div>

                          {/* Label */}
                          <div className="text-xs sm:text-sm font-medium mt-1">
                            {stat.label}
                          </div>

                          {/* Subtext */}
                          <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                            {stat.sub}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Marquee Section - CSS animation */}
        <section className="py-4 sm:py-8 bg-secondary/5 border-y border-border/50 overflow-hidden">
          <div className="flex marquee" style={{ width: "fit-content" }}>
            {[...Array(2)].map((_, setIndex) => (
              <div
                key={setIndex}
                className="flex gap-4 sm:gap-8 whitespace-nowrap"
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 sm:gap-8 text-lg sm:text-2xl font-bold text-muted-foreground/30 px-4"
                  >
                    <span>CREATORS</span>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary/50" />
                    <span>BRANDS</span>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-accent/50" />
                    <span>COLLABORATIONS</span>
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary/50" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24 md:py-32 relative">
          <div className="absolute inset-0 dotted-pattern opacity-30" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 sm:mb-16 md:mb-20"
            >
              {/* <Badge className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 glass-card text-primary border-0 text-sm">
                Simple Process
              </Badge> */}
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
                <span className="text-muted-foreground/50">Three steps to</span>
                <br />
                <span className="gradient-text">your next collab</span>
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Be one of the first to try it
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="relative h-full overflow-hidden group border-2 border-transparent hover:border-primary/20 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                    {/* Large step number background */}
                    <div className="absolute -top-6 sm:-top-10 -right-4 sm:-right-6 text-[100px] sm:text-[140px] md:text-[180px] font-black text-primary/5 leading-none select-none group-hover:text-primary/10 transition-colors">
                      {step.number}
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300" />

                    <CardContent className="p-5 sm:p-8 md:p-10 relative z-10">
                      <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">
                        {step.icon}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-primary mb-2 sm:mb-3 tracking-widest">
                        STEP {step.number}
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid with Bento Layout */}
        <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-40" />
          <FloatingOrb
            className="hidden sm:block w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-primary/10 top-0 right-0"
            delayed={1}
          />
          <FloatingOrb
            className="hidden sm:block w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-accent/10 bottom-0 left-0"
            delayed={2}
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 sm:mb-16 md:mb-20"
            >
              {/* <Badge className="mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 gradient-instagram text-white border-0 shadow-lg text-sm">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Core Features
              </Badge> */}
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Simple tools to
                <br />
                <span className="gradient-text">get started</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isLarge = index === 0 || index === 3;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className={isLarge ? "lg:col-span-2" : ""}
                  >
                    <Card className="h-full group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                      {/* Animated gradient border */}
                      <div className="absolute inset-0 p-[1px] rounded-lg overflow-hidden">
                        <div className="absolute inset-0 gradient-instagram opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardContent
                        className={`relative bg-card rounded-lg ${isLarge ? "p-6 sm:p-8 md:p-10" : "p-5 sm:p-6 md:p-8"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-5 w-5 sm:h-6 md:h-7 sm:w-6 md:w-7 text-white" />
                        </div>
                        <h3
                          className={`${isLarge
                              ? "text-xl sm:text-2xl md:text-3xl"
                              : "text-lg sm:text-xl md:text-2xl"
                            } font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors`}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className={`text-muted-foreground ${isLarge
                              ? "text-sm sm:text-base md:text-lg"
                              : "text-sm sm:text-base"
                            } leading-relaxed`}
                        >
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Section - Role-based */}
        <section className="py-20 sm:py-28 md:py-36 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/50 to-background" />
          <div className="absolute inset-0 dotted-pattern opacity-30" />

          {/* Decorative elements */}
          <FloatingOrb
            className="hidden sm:block w-[400px] h-[400px] bg-primary/10 -top-20 -left-20"
            delayed={0}
          />
          <FloatingOrb
            className="hidden sm:block w-[500px] h-[500px] bg-accent/10 -bottom-20 -right-20"
            delayed={1}
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-5xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 sm:mb-6">
                Ready to start
                <br />
                <span className="gradient-text">collaborating?</span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-14 max-w-2xl mx-auto">
                Join a growing community of creators and brands building authentic partnerships together.
              </p>

              {/* Two-column CTA cards */}
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Creator CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl gradient-instagram p-[1px]">
                    <div className="relative bg-background rounded-2xl p-6 sm:p-8 h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold">For Creators</h3>
                          <p className="text-sm text-muted-foreground">Find your next collab</p>
                        </div>
                      </div>

                      <ul className="text-left space-y-2 mb-6 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Browse campaigns from real brands
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Apply with one click
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Get paid for authentic content
                        </li>
                      </ul>

                      <Button
                        className="w-full gradient-instagram group/btn"
                        size="lg"
                        onClick={() => navigate("/auth?role=influencer&mode=signup")}
                      >
                        Join as Creator
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Brand CTA */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 hover:border-accent/50 transition-colors">
                    <div className="relative bg-gradient-to-br from-accent/5 to-transparent rounded-2xl p-6 sm:p-8 h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold">For Brands</h3>
                          <p className="text-sm text-muted-foreground">Find authentic creators</p>
                        </div>
                      </div>

                      <ul className="text-left space-y-2 mb-6 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Post campaigns in minutes
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Review creator applications
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Connect directly, no middlemen
                        </li>
                      </ul>

                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-white group/btn"
                        size="lg"
                        onClick={() => navigate("/auth?role=brand&mode=signup")}
                      >
                        Start as Brand
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Simple pricing link */}
              <motion.div
                className="mt-10 sm:mt-14"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className="text-muted-foreground text-sm mb-3">
                  Free to start • No credit card required
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="text-primary hover:underline font-medium text-sm inline-flex items-center gap-1"
                >
                  View all pricing options
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
