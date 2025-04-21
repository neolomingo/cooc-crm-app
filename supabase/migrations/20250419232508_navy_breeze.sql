/*
  # Reset all check-ins and member statuses
  
  1. Changes
    - Update all active check-ins to be checked out
    - Reset all checked-in guests to be checked out
    - Reset member last_visit timestamps
*/

-- Update all active check-ins to be checked out
UPDATE check_ins 
SET check_out_time = now()
WHERE check_out_time IS NULL;

-- Update all checked-in guests to be checked out
UPDATE guests
SET checked_in = false,
    checked_in_time = NULL
WHERE checked_in = true;

-- Reset member last_visit timestamps
UPDATE members
SET last_visit = NULL
WHERE last_visit IS NOT NULL;