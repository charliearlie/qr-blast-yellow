import QRGenerator from '@/components/QRGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <QRGenerator />
      
      {/* Footer Ad Space */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="ad-space p-8 min-h-[100px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="font-bold">BANNER AD SPACE</p>
            <p className="text-sm mt-1">728x90 or responsive banner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
