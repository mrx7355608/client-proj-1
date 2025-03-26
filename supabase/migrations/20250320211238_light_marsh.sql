/*
  # Add User Permissions Schema

  1. New Tables
    - `user_page_permissions`: Store page-level access
    - `user_feature_permissions`: Store feature-level access
    - `pages`: Reference table for available pages
    - `features`: Reference table for available features

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create pages table
CREATE TABLE pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create features table
CREATE TABLE features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(page_id, name)
);

-- Create user page permissions table
CREATE TABLE user_page_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  page_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  has_access boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Create user feature permissions table
CREATE TABLE user_feature_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_id uuid REFERENCES features(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_id)
);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON pages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable admin write access"
  ON pages FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Enable read access for authenticated users"
  ON features FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable admin write access"
  ON features FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Enable read access for authenticated users"
  ON user_page_permissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable admin write access"
  ON user_page_permissions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Enable read access for authenticated users"
  ON user_feature_permissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable admin write access"
  ON user_feature_permissions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create updated_at triggers
CREATE TRIGGER update_user_page_permissions_updated_at
    BEFORE UPDATE ON user_page_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_feature_permissions_updated_at
    BEFORE UPDATE ON user_feature_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default pages
INSERT INTO pages (name, description) VALUES
  ('Dashboard', 'Main dashboard and overview'),
  ('Clients', 'Client management'),
  ('Partners', 'Partner management'),
  ('Proposals', 'Proposal creation and management'),
  ('Inventory', 'Inventory management'),
  ('Documents', 'Document management'),
  ('Global Expenses', 'Global expense tracking'),
  ('Settings', 'System settings');

-- Insert default features
WITH pages_data AS (
  SELECT id, name FROM pages
)
INSERT INTO features (page_id, name, description)
SELECT 
  p.id,
  f.name,
  f.description
FROM pages_data p
CROSS JOIN (
  VALUES 
    ('Dashboard', 'revenue-chart', 'View revenue charts'),
    ('Dashboard', 'client-stats', 'View client statistics'),
    ('Dashboard', 'expense-summary', 'View expense summaries'),
    
    ('Clients', 'add-client', 'Add new clients'),
    ('Clients', 'edit-client', 'Edit existing clients'),
    ('Clients', 'delete-client', 'Delete clients'),
    ('Clients', 'view-financials', 'View financial information'),
    
    ('Partners', 'add-partner', 'Add new partners'),
    ('Partners', 'edit-partner', 'Edit existing partners'),
    ('Partners', 'delete-partner', 'Delete partners'),
    ('Partners', 'revenue-sharing', 'Manage revenue sharing'),
    
    ('Inventory', 'add-inventory', 'Add new inventory items'),
    ('Inventory', 'edit-inventory', 'Edit inventory items'),
    ('Inventory', 'delete-inventory', 'Delete inventory items'),
    ('Inventory', 'manage-sites', 'Manage inventory sites'),
    
    ('Documents', 'upload-documents', 'Upload new documents'),
    ('Documents', 'delete-documents', 'Delete documents'),
    ('Documents', 'view-all-documents', 'View all documents'),
    
    ('Global Expenses', 'add-expenses', 'Add new expenses'),
    ('Global Expenses', 'edit-expenses', 'Edit expenses'),
    ('Global Expenses', 'delete-expenses', 'Delete expenses')
  ) AS f(page_name, name, description)
WHERE p.name = f.page_name;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid)
RETURNS TABLE (
  page_name text,
  page_access boolean,
  features jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_features AS (
    SELECT 
      f.page_id,
      jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'name', f.name,
          'enabled', COALESCE(ufp.enabled, true)
        )
      ) as features
    FROM features f
    LEFT JOIN user_feature_permissions ufp ON 
      ufp.feature_id = f.id AND 
      ufp.user_id = p_user_id
    GROUP BY f.page_id
  )
  SELECT 
    p.name as page_name,
    COALESCE(upp.has_access, true) as page_access,
    COALESCE(uf.features, '[]'::jsonb) as features
  FROM pages p
  LEFT JOIN user_page_permissions upp ON 
    upp.page_id = p.id AND 
    upp.user_id = p_user_id
  LEFT JOIN user_features uf ON uf.page_id = p.id
  ORDER BY p.name;
END;
$$;

-- Create function to update user permissions
CREATE OR REPLACE FUNCTION update_user_permissions(
  p_user_id uuid,
  p_permissions jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_page record;
  v_feature record;
  v_page_permissions jsonb;
  v_features jsonb;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can update permissions';
  END IF;

  -- Process each page's permissions
  FOR v_page IN 
    SELECT * FROM pages
  LOOP
    v_page_permissions := p_permissions->v_page.name;
    
    -- Update page access
    INSERT INTO user_page_permissions (
      user_id,
      page_id,
      has_access
    )
    VALUES (
      p_user_id,
      v_page.id,
      (v_page_permissions->>'access')::boolean
    )
    ON CONFLICT (user_id, page_id)
    DO UPDATE SET 
      has_access = (v_page_permissions->>'access')::boolean,
      updated_at = now();

    -- Update feature permissions
    v_features := v_page_permissions->'features';
    IF v_features IS NOT NULL THEN
      FOR v_feature IN 
        SELECT * FROM features WHERE page_id = v_page.id
      LOOP
        INSERT INTO user_feature_permissions (
          user_id,
          feature_id,
          enabled
        )
        VALUES (
          p_user_id,
          v_feature.id,
          (v_features->>v_feature.name)::boolean
        )
        ON CONFLICT (user_id, feature_id)
        DO UPDATE SET 
          enabled = (v_features->>v_feature.name)::boolean,
          updated_at = now();
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_permissions TO authenticated;