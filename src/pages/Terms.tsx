import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-primary mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using GrowPro's website and services, you agree to be bound by these Terms and Conditions. 
                If you do not agree with any part of these terms, you may not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Products and Services</h2>
              <p className="text-muted-foreground">
                All products and prices are subject to change without notice. We reserve the right to limit quantities 
                and discontinue products at any time. Product descriptions and images are provided for informational 
                purposes and may not be entirely accurate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Orders and Payment</h2>
              <p className="text-muted-foreground">
                All orders are subject to acceptance and availability. We reserve the right to refuse any order. 
                Prices are listed in Trinidad and Tobago Dollars (TTD). Payment must be made in full before order processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Delivery</h2>
              <p className="text-muted-foreground">
                Delivery times are estimates and not guaranteed. We are not liable for delays in delivery. 
                Risk of loss and title for products pass to you upon delivery.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground">
                Returns are subject to our discretion. Products must be in original condition with packaging intact. 
                Contact us within 7 days of receipt for return authorization. Refunds will be processed within 14 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                GrowPro shall not be liable for any indirect, incidental, special, or consequential damages arising 
                from the use of our products or services. Our total liability shall not exceed the purchase price of the product.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms shall be governed by and construed in accordance with the laws of Trinidad and Tobago.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms and Conditions, please contact us at info@growpro.com or call (868) 123-4567.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
