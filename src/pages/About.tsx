import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Leaf, Users, Award, TrendingUp } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: "Sustainability",
      description: "We prioritize eco-friendly products and sustainable growing practices.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive community of passionate growers at all levels.",
    },
    {
      icon: Award,
      title: "Quality",
      description: "Only the highest quality equipment and supplies for optimal results.",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Staying ahead with the latest growing technologies and techniques.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-card to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 text-primary">About GrowPro</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your trusted partner in cultivating success. We provide premium growing equipment 
                and expert guidance to help you achieve the perfect grow, every time.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-primary">Our Story</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  Founded with a passion for helping growers succeed, GrowPro has become Trinidad and Tobago's 
                  premier destination for premium growing equipment and supplies. What started as a small 
                  operation has grown into a trusted resource for both hobbyists and professional cultivators.
                </p>
                <p>
                  We understand that successful growing requires more than just equipment—it requires knowledge, 
                  support, and the right tools for your specific needs. That's why we've curated a comprehensive 
                  selection of products from the industry's leading manufacturers, backed by our team's expertise 
                  and commitment to your success.
                </p>
                <p>
                  Whether you're setting up your first grow tent or optimizing a commercial operation, 
                  we're here to provide the equipment, knowledge, and support you need to grow like a pro.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To empower growers with premium equipment, expert knowledge, and unwavering support, 
                helping them achieve exceptional results while fostering a thriving community of 
                passionate cultivators across Trinidad and Tobago.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
