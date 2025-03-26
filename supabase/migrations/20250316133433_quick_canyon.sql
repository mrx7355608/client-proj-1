/*
  # Create Network Buildout Quote Template

  1. Changes
    - Insert default template for network/camera buildouts
    - Add professional sections with proper formatting
    - Include standard terms and conditions
*/

-- Insert the network buildout template
INSERT INTO quote_templates (
  name,
  description,
  type,
  version,
  is_active
)
VALUES (
  'Network & Camera Buildout',
  'Professional template for network infrastructure and camera system installations',
  'network_buildout',
  1,
  true
);

-- Insert template sections
WITH template AS (
  SELECT id FROM quote_templates 
  WHERE name = 'Network & Camera Buildout' 
  ORDER BY created_at DESC 
  LIMIT 1
)
INSERT INTO quote_sections (template_id, type, name, content, order_index)
VALUES
  -- Header Section
  (
    (SELECT id FROM template),
    'header',
    'Quote Header',
    E'# {{company_name}}\n\n' ||
    'Quote Number: {{quote_number}}\n' ||
    'Date: {{date}}\n' ||
    'Valid Until: {{valid_until}}\n\n' ||
    '**Bill To:**\n' ||
    '{{client_name}}\n' ||
    '{{address}}\n',
    1
  ),
  
  -- Introduction Section
  (
    (SELECT id FROM template),
    'introduction',
    'Project Overview',
    E'## Project Overview\n\n' ||
    'Thank you for the opportunity to provide this quote for your network and camera system buildout project. ' ||
    'This proposal outlines our recommended solution based on your specific requirements and industry best practices.\n\n' ||
    '### Current Environment\n' ||
    'Based on our site survey and discussions, we understand your current environment and requirements as follows:\n\n' ||
    '- Existing network infrastructure assessment\n' ||
    '- Security and surveillance needs\n' ||
    '- Coverage areas and monitoring requirements\n' ||
    '- Network capacity and performance expectations\n',
    2
  ),
  
  -- Scope Section
  (
    (SELECT id FROM template),
    'scope',
    'Scope of Work',
    E'## Scope of Work\n\n' ||
    '### Network Infrastructure\n' ||
    '- Network design and architecture\n' ||
    '- Equipment installation and configuration\n' ||
    '- Network security implementation\n' ||
    '- Performance testing and optimization\n\n' ||
    '### Camera System\n' ||
    '- Camera placement and mounting\n' ||
    '- Power and data cabling\n' ||
    '- Recording system setup\n' ||
    '- Remote access configuration\n\n' ||
    '### Project Management\n' ||
    '- Project planning and coordination\n' ||
    '- Installation scheduling\n' ||
    '- Testing and quality assurance\n' ||
    '- System documentation and training\n',
    3
  ),
  
  -- Pricing Section
  (
    (SELECT id FROM template),
    'pricing',
    'Investment Summary',
    E'## Investment Summary\n\n' ||
    '### One-Time Costs\n' ||
    '{{quote_items_nrc}}\n\n' ||
    '**Total One-Time Investment: ${{total_nrc}}**\n\n' ||
    '### Monthly Recurring Costs\n' ||
    '{{quote_items_mrr}}\n\n' ||
    '**Total Monthly Investment: ${{total_mrr}}**\n\n' ||
    '*All prices are in USD and exclude applicable taxes*\n',
    4
  ),
  
  -- Terms Section
  (
    (SELECT id FROM template),
    'terms',
    'Terms and Conditions',
    E'## Terms and Conditions\n\n' ||
    '1. **Payment Terms**\n' ||
    '   - 50% deposit required to initiate project\n' ||
    '   - Remaining balance due upon project completion\n' ||
    '   - Monthly services billed in advance\n\n' ||
    '2. **Project Timeline**\n' ||
    '   - Estimated completion: 2-3 weeks from project initiation\n' ||
    '   - Timeline subject to equipment availability and site access\n\n' ||
    '3. **Warranty**\n' ||
    '   - Hardware: Manufacturer''s warranty applies\n' ||
    '   - Installation: 1-year workmanship warranty\n' ||
    '   - Software: 90-day configuration warranty\n\n' ||
    '4. **Support and Maintenance**\n' ||
    '   - 24/7 emergency support available\n' ||
    '   - Regular maintenance included in monthly services\n' ||
    '   - Software updates and patches included\n\n' ||
    '5. **Limitations**\n' ||
    '   - Quote valid for 30 days\n' ||
    '   - Additional costs may apply for unforeseen circumstances\n' ||
    '   - Changes to scope may affect pricing\n',
    5
  ),
  
  -- Signature Section
  (
    (SELECT id FROM template),
    'signature',
    'Acceptance',
    E'## Acceptance\n\n' ||
    'By signing below, you agree to the terms and conditions outlined in this quote.\n\n' ||
    'Accepted By: _______________________\n\n' ||
    'Title: ____________________________\n\n' ||
    'Date: ____________________________\n\n' ||
    'Signature: ________________________\n\n' ||
    'Purchase Order # (if required): _______________\n',
    6
  );