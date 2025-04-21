/*
  # Reset all check-ins and guestlists

  1. Changes
    - Reset all guest check-ins to false
    - Close any open check-in records
    - Clear member last visit timestamps
*/

-- Update all checked-in guests to be checked out
UPDATE guests
SET checked_in = false,
    checked_in_time = NULL
WHERE checked_in = true;

-- Update all active check-ins to be checked out
UPDATE check_ins 
SET check_out_time = now()
WHERE check_out_time IS NULL;

-- Reset member last_visit timestamps
UPDATE members
SET last_visit = NULL
WHERE last_visit IS NOT NULL;