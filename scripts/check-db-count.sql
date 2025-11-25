-- Quick script to check database counts
-- Run this to verify if database is actually empty

SELECT 
  'Total Registrations' AS metric,
  COUNT(*) AS count
FROM registrations

UNION ALL

SELECT 
  'Paid' AS metric,
  COUNT(*) AS count
FROM registrations
WHERE status = 'paid'

UNION ALL

SELECT 
  'Pending Online' AS metric,
  COUNT(*) AS count
FROM registrations
WHERE status = 'pending_online'

UNION ALL

SELECT 
  'Pending Cash' AS metric,
  COUNT(*) AS count
FROM registrations
WHERE status = 'pending_cash'

UNION ALL

SELECT 
  'Rejected' AS metric,
  COUNT(*) AS count
FROM registrations
WHERE status = 'rejected';

-- Also show all registration IDs if any exist
SELECT id, registration_number, name, status, created_at 
FROM registrations 
ORDER BY created_at DESC 
LIMIT 10;

