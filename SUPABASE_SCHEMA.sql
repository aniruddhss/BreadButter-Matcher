-- 🎯 Supabase Table Creation SQL

-- Table: talents
CREATE TABLE talents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text,
  city text,
  style_tags text[],
  budget_min int,
  budget_max int,
  embedding float8[]
);

-- Table: briefs
CREATE TABLE briefs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  text text,
  location text,
  budget int,
  style_tags text[],
  embedding float8[]
);

-- Table: feedback
CREATE TABLE feedback (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  brief_id uuid REFERENCES briefs(id),
  talent_id uuid REFERENCES talents(id),
  rating int,
  comment text,
  timestamp timestamptz
);
