import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Rise } from '@/components/motion';
import { Users, Zap, Heart, Shield } from 'lucide-react';

/* Long-form reading page. Body copy is held at a ~68ch measure, the display
   face carries the headings only. Removed: the blurred primary glow behind
   the facts card, the gradient icon tiles, the `border border-border
   border-2` codemod artefact and the raw `text-white` badge. */

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

  const facts = [
    { value: 'Growing', label: 'User Base' },
    { value: 'Early', label: 'Stage Beta' },
    { value: 'Active', label: 'Development' },
    { value: 'India', label: 'Based' },
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

      <article className="container py-16 sm:py-20">
        {/* ------------------------------------------------------------ head */}
        <Rise className="max-w-[46ch]">
          <p className="eyebrow mb-5">Our Story</p>
          <h1 className="font-display text-display-2">About FameSync</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            We're building a simple way for micro-creators and brands to find each other and
            collaborate authentically.
          </p>
        </Rise>

        {/* --------------------------------------------------------- mission */}
        <section className="mt-16 grid items-start gap-12 border-t border-border pt-14 lg:mt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Rise>
            <h2 className="font-display text-display-3">Our Mission</h2>
            <div className="mt-5 max-w-[68ch] space-y-5 text-[1.0625rem] leading-[1.7] text-muted-foreground">
              <p>
                FameSync started because we noticed something: micro-creators struggle to find brand collaborations, and small brands struggle to find the right creators.
              </p>
              <p>
                We're building a straightforward platform where both sides can connect without the complexity of traditional influencer marketing tools.
              </p>
              <p>
                We're still early — actively growing our community and improving based on feedback from our first users.
              </p>
            </div>
          </Rise>

          <Rise delay={0.06}>
            <Card intent="tinted" className="rounded-2xl p-8">
              <span className="eyebrow text-secondary-foreground/70">Where we are</span>
              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <div className="num text-[1.75rem] leading-none">{fact.value}</div>
                    <div className="mt-2 text-sm text-secondary-foreground/70">{fact.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </Rise>
        </section>

        {/* ---------------------------------------------------------- values */}
        <section className="mt-16 border-t border-border pt-14 lg:mt-20">
          <Rise className="max-w-[52ch]">
            <h2 className="font-display text-display-3">Our Values</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              These core principles guide everything we do at FameSync.
            </p>
          </Rise>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Rise key={value.title}>
                  <Card className="h-full p-7">
                    <span className="mb-6 inline-flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mb-2.5 font-display text-display-3">{value.title}</h3>
                    <p className="max-w-[52ch] leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </Card>
                </Rise>
              );
            })}
          </div>
        </section>
      </article>
    </>
  );
};

export default About;
