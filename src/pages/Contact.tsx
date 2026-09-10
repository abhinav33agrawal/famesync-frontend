import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'info@famesync.com',
      link: 'mailto:info@famesync.com',
      description: 'Send us an email anytime'
    },
    {
      icon: MessageCircle,
      title: 'Response Time',
      value: '24-48 hours',
      link: null,
      description: 'We respond quickly'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'We\'ll get back to you within 24 hours.',
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - FameSync | Get in Touch</title>
        <meta name="description" content="Contact FameSync for support, partnerships, or inquiries. Reach our team via email, phone, or our contact form. We're here to help!" />
        <meta name="keywords" content="contact famesync, customer support, influencer marketing help, brand partnerships contact" />
        <link rel="canonical" href="https://famesync.com/contact" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://famesync.com/contact" />
        <meta property="og:title" content="Contact Us - FameSync" />
        <meta property="og:description" content="Get in touch with the FameSync team. We're here to help!" />
        <meta property="og:image" content="https://famesync.com/og-image.png" />
        <meta property="og:site_name" content="FameSync" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://famesync.com/contact" />
        <meta name="twitter:title" content="Contact Us - FameSync" />
        <meta name="twitter:description" content="Get in touch with the FameSync team. We're here to help!" />
        <meta name="twitter:image" content="https://famesync.com/og-image.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact FameSync",
            "url": "https://famesync.com/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "FameSync",
              "email": "info@famesync.com",
              "telephone": "+1-555-123-4567"
            }
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
              <MessageCircle className="w-4 h-4 mr-2" />
              Get in Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contact <span className="text-foreground">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.header>

          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-card border border-border border-2 hover:border-primary/50 transition-all h-full text-center group">
                    <CardContent className="p-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="font-bold text-xl mb-3">{info.title}</h3>
                      {info.link ? (
                        <a 
                          href={info.link} 
                          className="text-primary hover:text-primary/80 transition-colors font-medium text-lg"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-foreground font-medium text-lg">{info.value}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-3">{info.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <Card className="bg-card border border-border border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 max-w-3xl mx-auto">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-8 text-center">
                  Send us a <span className="text-foreground">Message</span>
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="Your name" 
                        required 
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        required 
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help?" 
                      required 
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..." 
                      required 
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary lift" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions about FameSync
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { q: 'How do I join FameSync?', a: 'Simply sign up for a free account and complete your profile to start browsing campaigns.' },
              { q: 'Is FameSync really free?', a: 'Yes! FameSync is free to join.' },
              { q: 'How quickly will I hear back?', a: 'We typically respond to inquiries within 24-48 hours.' },
              { q: 'Can brands join too?', a: 'Absolutely! Brands can create campaigns and connect with creators.' }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-card border border-border border hover:border-primary/30 transition-all p-6">
                  <h3 className="font-semibold text-lg mb-3 text-primary">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </article>
    </>
  );
};

export default Contact;

