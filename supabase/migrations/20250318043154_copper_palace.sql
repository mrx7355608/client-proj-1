/*
  # Add UNM Template

  1. Changes
    - Insert UNM template into quote_templates
    - Add template sections with professional content
    - Include pricing and terms sections

  2. Security
    - Maintain existing RLS policies
*/

-- Insert the UNM template
INSERT INTO quote_templates (
  name,
  description,
  type,
  version,
  is_active
)
VALUES (
  'UNM Services Agreement',
  'Professional template for unified network management services',
  'unm',
  1,
  true
);

-- Insert template sections
WITH template AS (
  SELECT id FROM quote_templates 
  WHERE name = 'UNM Services Agreement' 
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
    'Service Overview',
    E'## Unified Network Management Services\n\n' ||
    'Thank you for considering our Unified Network Management (UNM) services. ' ||
    'This proposal outlines our comprehensive solution designed to streamline your network operations ' ||
    'and enhance your infrastructure management capabilities.\n\n' ||
    '### Current Environment\n' ||
    'Based on our assessment, we understand your current network environment includes:\n\n' ||
    '- Network infrastructure complexity and scale\n' ||
    '- Monitoring and management requirements\n' ||
    '- Performance optimization needs\n' ||
    '- Security and compliance considerations\n',
    2
  ),
  
  -- Scope Section
  (
    (SELECT id FROM template),
    'scope',
    'Service Details',
    E'## Service Components\n\n' ||
    '### 1. Network Monitoring & Management\n' ||
    '- 24/7 network monitoring and alerting\n' ||
    '- Performance tracking and optimization\n' ||
    '- Bandwidth utilization analysis\n' ||
    '- Configuration management\n\n' ||
    '### 2. Security Services\n' ||
    '- Firewall management\n' ||
    '- Threat detection and response\n' ||
    '- Security policy enforcement\n' ||
    '- Compliance monitoring\n\n' ||
    '### 3. Optimization Services\n' ||
    '- Traffic prioritization\n' ||
    '- Load balancing\n' ||
    '- Route optimization\n' ||
    '- QoS management\n\n' ||
    '### 4. Reporting & Analytics\n' ||
    '- Monthly performance reports\n' ||
    '- Capacity planning insights\n' ||
    '- Trend analysis\n' ||
    '- ROI metrics\n',
    3
  ),
  
  -- Pricing Section
  (
    (SELECT id FROM template),
    'pricing',
    'Investment Summary',
    E'## Investment Details\n\n' ||
    '### Monthly Recurring Services\n' ||
    '{{quote_items_mrr}}\n\n' ||
    '**Total Monthly Investment: ${{total_mrr}}**\n\n' ||
    '### One-Time Costs\n' ||
    '{{quote_items_nrc}}\n\n' ||
    '**Total One-Time Investment: ${{total_nrc}}**\n\n' ||
    '*All prices are in USD and exclude applicable taxes*\n\n' ||
    '### Service Level Agreement\n' ||
    '- 99.9% network availability guarantee\n' ||
    '- 4-hour response time for critical issues\n' ||
    '- Monthly service reviews\n',
    4
  ),
  
  -- Terms Section
  (
    (SELECT id FROM template),
    'terms',
    'Terms and Conditions',
    E'## Terms and Conditions\n\n' ||
    '1. **Service Agreement**\n' ||
    '   - Initial term: {{term_months}} months\n' ||
    '   - Auto-renewal unless cancelled\n' ||
    '   - 60-day cancellation notice required\n\n' ||
    '2. **Payment Terms**\n' ||
    '   - Monthly services billed in advance\n' ||
    '   - Net 30 payment terms\n' ||
    '   - Late payments subject to 1.5% monthly fee\n\n' ||
    '3. **Service Delivery**\n' ||
    '   - 24/7 monitoring and support\n' ||
    '   - Quarterly business reviews\n' ||
    '   - Dedicated account manager\n\n' ||
    '4. **Client Responsibilities**\n' ||
    '   - Provide necessary access and credentials\n' ||
    '   - Maintain current backups\n' ||
    '   - Timely communication of changes\n\n' ||
    '5. **Limitations**\n' ||
    '   - Quote valid for 30 days\n' ||
    '   - Hardware costs not included unless specified\n' ||
    '   - Additional services billed at standard rates\n',
    5
  ),
  
  -- Signature Section
  (
    (SELECT id FROM template),
    'signature',
    'Acceptance',
    E'## Service Agreement Acceptance\n\n' ||
    'By signing below, you agree to the terms and conditions outlined in this service agreement.\n\n' ||
    'Accepted By: _______________________\n\n' ||
    'Title: ____________________________\n\n' ||
    'Date: ____________________________\n\n' ||
    'Signature: ________________________\n\n' ||
    'Purchase Order # (if required): _______________\n',
    6
  );