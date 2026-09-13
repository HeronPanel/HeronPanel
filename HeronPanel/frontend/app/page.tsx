export default function Page() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Server Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your HeronPanel infrastructure</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {['Total Instances', 'Active', 'System Health', 'Average Resource Usage'].map((card) => (
          <div key={card} className="p-6 rounded-xl border border-border bg-card shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">{card}</p>
            <p className="text-2xl font-bold">--</p>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Your Servers</div>
        <div className="p-8 text-center text-muted-foreground">
          No servers found. Start by creating your first game server!
        </div>
      </div>
    </div>
  );
}
