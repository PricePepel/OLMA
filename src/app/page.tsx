import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  MapPin, 
  Trophy, 
  Shield, 
  Globe,
  Code,
  Languages,
  Palette,
  Briefcase,
  Heart,
  Utensils,
  Calculator,
  BookOpenCheck,
  Cpu,
  Music,
  MessageSquare,
  Building,
  Dumbbell,
  Coffee
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">OLMA</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Learn Together,
            <span className="gradient-text"> Grow Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect with peers in your area to exchange skills, join learning clubs, 
            attend events, and earn rewards. OLMA makes offline learning social and engaging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Learning
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for peer learning
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              OLMA provides all the tools you need to connect, learn, and grow with your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Skill Exchange */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Skill Exchange</CardTitle>
                <CardDescription>
                  Teach what you know, learn what you don't. Connect with peers to exchange skills and knowledge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Find teachers and students nearby</li>
                  <li>• Set your own rates and schedules</li>
                  <li>• Track your learning progress</li>
                </ul>
              </CardContent>
            </Card>

            {/* Learning Clubs */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Learning Clubs</CardTitle>
                <CardDescription>
                  Join or create clubs around your interests. Collaborate, share resources, and learn together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Create and manage clubs</li>
                  <li>• Share resources and discussions</li>
                  <li>• Organize club events</li>
                </ul>
              </CardContent>
            </Card>

            {/* Events & Meetups */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Events & Meetups</CardTitle>
                <CardDescription>
                  Discover and attend local learning events, workshops, and meetups in your area.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse upcoming events</li>
                  <li>• RSVP and get reminders</li>
                  <li>• Connect with attendees</li>
                </ul>
              </CardContent>
            </Card>

            {/* Direct Messaging */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Direct Messaging</CardTitle>
                <CardDescription>
                  Chat directly with other learners to arrange sessions, ask questions, and build connections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Private conversations</li>
                  <li>• File and link sharing</li>
                  <li>• Real-time notifications</li>
                </ul>
              </CardContent>
            </Card>

            {/* Location-based Matching */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Location-based Matching</CardTitle>
                <CardDescription>
                  Find learners and teachers near you. Opt-in location sharing for better local connections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Find nearby learners</li>
                  <li>• Discover local events</li>
                  <li>• Privacy-first approach</li>
                </ul>
              </CardContent>
            </Card>

            {/* Gamification & Rewards */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Gamification & Rewards</CardTitle>
                <CardDescription>
                  Earn points, unlock achievements, and climb leaderboards as you learn and teach.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Earn learning currency</li>
                  <li>• Unlock achievements</li>
                  <li>• Track your progress</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skills Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Skills for every interest
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From programming to cooking, languages to fitness - find the skills you want to learn or teach.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { icon: Calculator, name: 'Academic Sciences', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20' },
              { icon: Cpu, name: 'IT & Digital Skills', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' },
              { icon: Languages, name: 'Languages', color: 'bg-green-100 text-green-600 dark:bg-green-900/20' },
              { icon: Palette, name: 'Creativity & Arts', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' },
              { icon: MessageSquare, name: 'Soft Skills', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20' },
              { icon: Building, name: 'Careers & Professions', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/20' },
              { icon: Dumbbell, name: 'Sports & Health', color: 'bg-red-100 text-red-600 dark:bg-red-900/20' },
              { icon: Coffee, name: 'Hobbies & Everyday Skills', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' },
            ].map((category) => (
              <div key={category.name} className="text-center">
                <div className={`w-16 h-16 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                  <category.icon className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Trust */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Safe and trusted learning
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your safety and privacy are our top priorities. We provide tools and features to ensure a secure learning environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
              <p className="text-muted-foreground">
                All users go through verification to ensure authentic learning experiences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Content Moderation</h3>
              <p className="text-muted-foreground">
                AI-powered and human-reviewed content filtering keeps the platform safe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Your data is protected with industry-standard encryption and privacy controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already connecting, sharing, and growing together on OLMA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Create Account
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">OLMA</span>
              </div>
              <p className="text-muted-foreground">
                Connecting learners worldwide through peer-to-peer education.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-foreground">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 OLMA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

