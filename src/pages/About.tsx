import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Zap, Heart, TrendingUp, Shield } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Authenticity First',
      description: 'We believe in genuine connections between brands and creators that drive real results.',
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Building a platform where both parties feel secure and informed throughout their journey.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Constantly evolving to provide the best tools and features for influencer marketing.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Fostering a vibrant ecosystem where creators and brands grow together.',
    },
  ];

  const team = [
    { name: 'Sarah Johnson', role: 'CEO & Founder', avatar: '👩‍💼' },
    { name: 'Mike Chen', role: 'CTO', avatar: '👨‍💻' },
    { name: 'Emily Davis', role: 'Head of Partnerships', avatar: '👩‍💼' },
    { name: 'James Wilson', role: 'Head of Product', avatar: '👨‍💼' },
  ];

  return (
    <>
      <Helmet>
        <title>About Us - FameSync | Creator-Brand Collaboration Platform</title>
        <meta name="description" content="Learn about FameSync – a simple platform connecting micro-creators with brands for authentic collaborations. Discover our mission and team." />
        <meta name="keywords" content="about famesync, influencer marketing platform, brand partnerships, creator economy, team" />
        <link rel="canonical" href="https://famesync.com/about" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://famesync.com/about" />
        <meta property="og:title" content="About Us - FameSync" />
        <meta property="og:description" content="A simple platform connecting micro-creators with brands for authentic collaborations." />
        <meta property="og:image" content="https://famesync.com/og-image.png" />
        <meta property="og:site_name" content="FameSync" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://famesync.com/about" />
        <meta name="twitter:title" content="About Us - FameSync" />
        <meta name="twitter:description" content="A simple platform connecting micro-creators with brands for authentic collaborations." />
        <meta name="twitter:image" content="https://famesync.com/og-image.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FameSync",
            "url": "https://famesync.com",
            "description": "Platform connecting micro-creators with brands",
            "foundingDate": "2024"
          })}
        </script>
      </Helmet>

      <article className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-white" variant="secondary">
              Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="text-foreground">FameSync</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're building a simple way for micro-creators and brands to find each other and collaborate authentically.
            </p>
          </motion.header>

          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center mb-12"
            >
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Our <span className="text-foreground">Mission</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  FameSync started because we noticed something: micro-creators struggle to find brand collaborations, and small brands struggle to find the right creators.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  We're building a straightforward platform where both sides can connect without the complexity of traditional influencer marketing tools.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're still early — actively growing our community and improving based on feedback from our first users.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary opacity-10 rounded-3xl blur-3xl"></div>
                <Card className="bg-card border border-border border-2 relative">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-4xl font-bold text-foreground mb-2">Growing</div>
                        <div className="text-sm text-muted-foreground">User Base</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground mb-2">Early</div>
                        <div className="text-sm text-muted-foreground">Stage Beta</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground mb-2">Active</div>
                        <div className="text-sm text-muted-foreground">Development</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-foreground mb-2">India</div>
                        <div className="text-sm text-muted-foreground">Based</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </section>

          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                Our <span className="text-foreground">Values</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do at FameSync.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card border border-border border-2 hover:border-primary/50 transition-all h-full">
                      <CardContent className="p-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4">
                Meet the <span className="text-foreground">Team</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A small team working to make creator-brand connections simpler.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border border-border border-2 hover:border-primary/50 transition-all text-center">
                    <CardContent className="p-6">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-4xl mx-auto mb-4">
                        {member.avatar}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section> */}
        </div>
      </article>
    </>
  );
};

export default About;
