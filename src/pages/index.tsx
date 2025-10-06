import Head from "next/head";
import Link from "next/link";
import { Leaf, Settings, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <Head>
        <title>GreenMind - Question Builder Platform</title>
        <meta
          name="description"
          content="AI-powered personality assessment question builder"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Leaf className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    GreenMind
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Question Builder Platform
                  </p>
                </div>
              </div>
              <Link href="/admin">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">
                AI-Powered Personality Assessment
              </h2>
              <p className="text-xl text-muted-foreground">
                Build comprehensive personality questionnaires using our intelligent
                question generation system
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Thread Halls
                </h3>
                <p className="text-muted-foreground">
                  Organize assessment categories with structured thread halls for
                  different personality dimensions
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Personality Traits
                </h3>
                <p className="text-muted-foreground">
                  Define specific traits within each category using the Big Five
                  personality model
                </p>
              </Card>

              <Card className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Behavioral Analysis
                </h3>
                <p className="text-muted-foreground">
                  Generate targeted questions based on specific behavioral patterns
                  and responses
                </p>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="bg-card border border-border rounded-lg p-8 mt-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Ready to Get Started?
                </h3>
                <p className="text-muted-foreground">
                  Access the admin dashboard to begin creating your personality
                  assessment questionnaires
                </p>
                <Link href="/admin">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Launch Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-16">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-muted-foreground">
              <p>
                &copy; 2024 GreenMind. AI-Powered Question Builder Platform.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
