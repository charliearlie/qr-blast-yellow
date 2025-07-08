import { QrCode, BarChart3, BrainCircuit, Shield, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { featureData } from '@/config/features';

interface FeatureShowcaseProps {
  features: typeof featureData;
}

const iconMap = {
  QrCode: QrCode,
  BarChart3: BarChart3,
  BrainCircuit: BrainCircuit,
  Shield: Shield,
};

const FeatureShowcase = ({ features }: FeatureShowcaseProps) => {
  const { features: featureCategories } = features.landingPage;

  return (
    <section id="features" className="py-20 bg-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            <span className="text-primary">POWERFUL</span> FEATURES
          </h2>
          <p className="text-xl font-bold text-muted-foreground max-w-3xl mx-auto">
            Create intelligent QR codes that go beyond simple redirection. Our platform offers advanced features for businesses and power users.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-24">
          {featureCategories.map((category, categoryIndex) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap];
            const isReversed = categoryIndex % 2 === 1;

            return (
              <div key={category.category} className="relative">
                {/* Category Header */}
                <div className={`flex items-center justify-center mb-12 ${isReversed ? 'flex-row-reverse' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-primary text-white rounded-lg border-4 border-black">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">
                      {category.category}
                    </h3>
                  </div>
                </div>

                {/* Feature Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {category.items.map((item, itemIndex) => {
                    const isProFeature = item.title.includes('Time-aware') || 
                                       item.title.includes('Geo-fenced') || 
                                       item.title.includes('Scan-Limited') ||
                                       item.title.includes('A/B Testing') ||
                                       item.title.includes('Password Protection');

                    return (
                      <Card key={itemIndex} className="brutal-card border-4 border-black bg-white hover:shadow-brutal transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-2xl font-black uppercase tracking-tight">
                              {item.title}
                            </CardTitle>
                            {isProFeature && (
                              <Badge variant="secondary" className="bg-primary text-white font-bold border-2 border-black">
                                PRO
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <CardDescription className="text-base font-medium leading-relaxed">
                            {item.description}
                          </CardDescription>
                          
                          {item['sub-features'].length > 0 && (
                            <div className="space-y-2">
                              {item['sub-features'].map((subFeature, subIndex) => (
                                <div key={subIndex} className="flex items-start space-x-3">
                                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm font-medium">{subFeature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <div className="bg-white border-4 border-black p-8 inline-block transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-4">
              Ready to get started?
            </h3>
            <p className="text-lg font-bold text-muted-foreground mb-6">
              Create your first intelligent QR code in seconds
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-bold uppercase border-4 border-black text-lg px-8 py-4"
              onClick={() => {
                document.getElementById('generator')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              Start Creating
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;