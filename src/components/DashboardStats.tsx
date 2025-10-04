import { Database, Brain, Network, TrendingUp, BookOpen, Users } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

const StatCard = ({ icon, title, value, description }: StatCardProps) => (
  <div className="circuit-frame bg-card p-6 space-y-3 hover:bg-card/80 transition-all">
    <div className="flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <h3 className="text-lg font-bold font-mono">{title}</h3>
    </div>
    <div className="text-3xl font-bold text-accent">{value}</div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export const DashboardStats = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        icon={<Database className="w-6 h-6" />}
        title="Publications"
        value="608+"
        description="NASA bioscience research papers indexed and searchable"
      />
      <StatCard
        icon={<Network className="w-6 h-6" />}
        title="Connections"
        value="1,200+"
        description="Research relationships mapped in knowledge graph"
      />
      <StatCard
        icon={<TrendingUp className="w-6 h-6" />}
        title="Research Areas"
        value="12+"
        description="Distinct areas of space biology research covered"
      />
      <StatCard
        icon={<Users className="w-6 h-6" />}
        title="Authors"
        value="500+"
        description="Contributing scientists and researchers worldwide"
      />
      <StatCard
        icon={<BookOpen className="w-6 h-6" />}
        title="Organisms"
        value="25+"
        description="Different species studied in space environments"
      />
      <StatCard
        icon={<Brain className="w-6 h-6" />}
        title="AI Insights"
        description="Powered by advanced language models for research analysis"
        value="∞"
      />
    </div>
  );
};
