export default function TestPage() {
  return (
    <div className="min-h-screen bg-gunsmith-black p-8">
      <h1 className="font-bebas text-6xl text-gunsmith-gold mb-4">TEST PAGE - GUNSMITHLOCAL</h1>
      <p className="text-gunsmith-text mb-4">This is regular text in gunsmith-text color.</p>
      <div className="bg-gunsmith-card p-6 rounded-lg border border-gunsmith-border mb-4">
        <h2 className="font-oswald text-2xl text-gunsmith-gold mb-2">Card Component</h2>
        <p className="text-gunsmith-text-secondary">This is a card with gunsmith styling.</p>
      </div>
      <button className="btn-primary mr-4">Primary Button</button>
      <button className="btn-secondary">Secondary Button</button>
      
      <div className="mt-8">
        <h3 className="text-xl text-gunsmith-gold mb-4">Color Test:</h3>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gunsmith-black border-2 border-white flex items-center justify-center text-white text-xs">Black</div>
          <div className="w-24 h-24 bg-gunsmith-gold flex items-center justify-center text-black text-xs">Gold</div>
          <div className="w-24 h-24 bg-gunsmith-card flex items-center justify-center text-white text-xs">Card</div>
          <div className="w-24 h-24 bg-gunsmith-accent flex items-center justify-center text-white text-xs">Accent</div>
          <div className="w-24 h-24 bg-gunsmith-header flex items-center justify-center text-white text-xs">Header</div>
        </div>
      </div>
    </div>
  )
}
