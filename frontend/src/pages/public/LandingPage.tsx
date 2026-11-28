import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Store,
  TrendingUp,
  Wallet,
  Zap,
  BarChart3,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimulatedBadge } from "@/components/ui/SimulatedBadge";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.08 },
  }),
};

const STEPS = [
  {
    icon: QrCode,
    title: "Scan or enter",
    text: "Scan the QR code on your ZRA Smart Invoice, or type the receipt ID. We read the ?id= straight from the QR link.",
  },
  {
    icon: BadgeCheck,
    title: "Verify instantly",
    text: "We check the simulated ZRA register and confirm the receipt is valid, unused and above the minimum amount.",
  },
  {
    icon: Gift,
    title: "Earn & redeem",
    text: "Collect points for every valid receipt and redeem them for simulated Zamtel airtime and data bundles.",
  },
];

const BENEFITS = [
  {
    icon: Wallet,
    title: "Rewards that add up",
    text: "Every valid receipt earns points toward real-feeling airtime and data rewards.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency first",
    text: "Verified sales give merchants and ZRA a clearer, read-only view of the economy.",
  },
  {
    icon: Zap,
    title: "Instant feedback",
    text: "No waiting. Verification, balance and redemption all respond in real time.",
  },
  {
    icon: TrendingUp,
    title: "Built for scale",
    text: "A clean API-first design that works on any device, from a phone to a dashboard.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />
        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
          >
            <Badge tone="brand" icon={<Sparkle />} className="mb-5">
              Zambia&apos;s receipt rewards loop
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Verify receipts.
              <br />
              <span className="text-gradient-brand">Earn real rewards.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-600">
              Risiti Loop turns everyday ZRA Smart Invoice receipts into points
              you can redeem for Zamtel airtime and data — while helping build a
              more transparent tax culture.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/app/verify">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Verify a receipt
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline">
                  See how it works
                </Button>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-brand-600" /> No sign-up
                friction
              </span>
              <span className="inline-flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-brand-600" /> Mobile-first
              </span>
              <SimulatedBadge label="Demo integrations" />
            </div>
          </motion.div>

          {/* Phone / receipt visual */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/50 via-transparent to-accent-200/40 blur-2xl" />
            <div className="rounded-[2rem] border border-ink-200/70 bg-white p-4 shadow-lift">
              <div className="rounded-3xl bg-ink-950 p-5">
                <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-ink-700" />
                <div className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Receipt verified
                    </span>
                    <Badge tone="success" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                      Valid
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink-700">
                    Synthetic Traders Lusaka
                  </p>
                  <p className="text-xs text-ink-400">Amount band · K50–K100</p>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 p-3">
                    <div>
                      <p className="text-xs font-medium text-brand-700">
                        Points earned
                      </p>
                      <p className="text-2xl font-extrabold text-brand-700">+10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-ink-400">Balance</p>
                      <p className="text-lg font-bold text-ink-900">40 pts</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                    <Gift className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-800">
                      Zamtel airtime K5
                    </p>
                    <p className="text-xs text-ink-400">50 points</p>
                  </div>
                  <span className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Redeem
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-ink-200/70 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {[
            { value: "10+", label: "Demo vendors" },
            { value: "70", label: "Demo receipts" },
            { value: "12", label: "Areas covered" },
            { value: "100%", label: "Simulated & safe" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <p className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-ink-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-page scroll-mt-20 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="brand" className="mb-4">
            How it works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Three steps from receipt to reward
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            A loop so simple it fits in your pocket. No paperwork, no waiting.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
                <Card hover className="h-full p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-bold text-ink-300">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {step.text}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="scroll-mt-20 bg-ink-950 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4 bg-white/10 text-brand-300 ring-white/10">
              Why Risiti Loop
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for citizens, merchants and the economy
            </h2>
            <p className="mt-4 text-lg text-ink-300">
              One loop, shared value for everyone in the chain.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-white">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-300">
                    {b.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stakeholder cards */}
      <section className="container-page py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <StakeholderCard
            to="/merchant"
            icon={Store}
            title="For merchants"
            text="See verified sales, estimated tax summaries and a seven-day sales analytics view — read-only and privacy-safe."
            cta="Open merchant dashboard"
          />
          <StakeholderCard
            to="/zra"
            icon={MapPin}
            title="For ZRA"
            text="Monitor no-receipt reporting hotspots and statistics across the country with a clear geographic view."
            cta="View ZRA insights"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center shadow-lift sm:px-12">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-brand-200" />
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to turn receipts into rewards?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-50">
              Start verifying in seconds. Your next airtime bundle is a receipt
              away.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/app/verify">
                <Button
                  size="lg"
                  className="bg-white text-brand-700 hover:bg-brand-50"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Get started
                </Button>
              </Link>
              <Link to="/app">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20 hover:text-white"
                >
                  Explore the app
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function StakeholderCard({
  to,
  icon: Icon,
  title,
  text,
  cta,
}: {
  to: string;
  icon: typeof Store;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <Card hover className="flex h-full flex-col p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 flex-1 text-ink-500">{text}</p>
      <Link
        to={to}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function Sparkle() {
  return <ReceiptText className="h-3.5 w-3.5" />;
}