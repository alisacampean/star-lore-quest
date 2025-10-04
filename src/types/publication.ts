export interface Publication {
  id: string;
  title: string;
  abstract?: string;
  year?: number;
  authors?: string;
  research_area?: string;
  organism?: string;
  experiment_type?: string;
  publication_url?: string;
  created_at?: string;
}

export interface GraphNode {
  id: string;
  title: string;
  year?: number;
  research_area?: string;
  val: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type?: string;
  strength: number;
}
