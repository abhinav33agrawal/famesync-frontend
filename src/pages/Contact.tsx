import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Rise } from '@/components/motion';
import { Mail, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

/* Removed: the gradient icon tiles, the gradient form panel, the
   `whileHover` scale/lift motions, the `text-white` badge and the
   `bg-card border border-border border-2` codemod artefacts. */

const FAQS = [
  { q: 'How do I join FameSync?', a: 'Simply sign up for a free account and complete your profile to start browsing campaigns.' },
  { q: 'Is FameSync really free?', a: 'Yes! FameSync is free to join.' },
  { q: 'How quickly will I hear back?', a: 'We typically respond to inquiries within 24-48 hours.' },
  { q: 'Can brands join too?', a: 'Absolutely! Brands can create campaigns and connect with creators.' },
];

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

      <article className="container py-16 sm:py-20">
        {/* ------------------------------------------------------------ head */}
        <Rise className="max-w-[46ch]">
          <p className="eyebrow mb-5">Get in Touch</p>
          <h1 className="font-display text-display-2">Contact Us</h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </Rise>

        {/* ---------------------------------------------------- reach us at */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Rise key={info.title} delay={index * 0.06}>
                <Card className="flex h-full items-start gap-4 p-6">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <span className="eyebrow">{info.title}</span>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="mt-1.5 block truncate font-display text-[1.1875rem] font-semibold tracking-[-0.02em] text-primary underline-offset-4 hover:underline"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="mt-1.5 font-display text-[1.1875rem] font-semibold tracking-[-0.02em]">
                        {info.value}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm text-muted-foreground">{info.description}</p>
                  </div>
                </Card>
              </Rise>
            );
          })}
        </div>

        {/* ------------------------------------------------------------ form */}
        <Rise className="mt-16">
          <Card className="rounded-2xl p-7 sm:p-10">
            <span className="eyebrow">Message us</span>
            <h2 className="mt-3 font-display text-display-3">Send us a message</h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" placeholder="How can we help?" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows={6}
                />
              </div>

              <Button type="submit" variant="form" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </Rise>

        {/* ------------------------------------------------------------- faq */}
        <section className="mt-16 border-t border-border pt-14">
          <Rise className="max-w-[52ch]">
            <h2 className="font-display text-display-3">Frequently Asked Questions</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Quick answers to common questions about FameSync
            </p>
          </Rise>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {FAQS.map((faq) => (
              <Rise key={faq.q}>
                <Card className="h-full p-6">
                  <h3 className="mb-2.5 font-display text-[1.0625rem] font-semibold tracking-[-0.015em]">
                    {faq.q}
                  </h3>
                  <p className="max-w-[52ch] leading-relaxed text-muted-foreground">{faq.a}</p>
                </Card>
              </Rise>
            ))}
          </div>
        </section>
      </article>
    </>
  );
};

export default Contact;
