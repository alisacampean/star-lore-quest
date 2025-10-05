export interface Publication {
  id: string;
  title: string;
  link: string;
  created_at?: string;
  abstract?: string;
  year?: number;
  authors?: string;
  research_area?: string;
  organism?: string;
  experiment_type?: string;
  publication_url?: string;
}

export interface GraphNode {
  id: string;
  title: string;
  year?: number;
  research_area?: string;
  val: number;
  x?: number;
  y?: number;
  link?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type?: string;
  strength: number;
  topics?: string[];
}
