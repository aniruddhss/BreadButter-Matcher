export interface Talent {
  id: string;
  name: string;
  city: string;
  budget_min: number;
  budget_max: number;
  style_tags: string[];
  embedding: number[];
}

export interface Brief {
  id: string;
  text: string;
  location: string;
  budget: number;
  style_tags: string[];
  embedding: number[];
}
