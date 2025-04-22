/*
  # Reset venue counter
  
  1. Changes
    - Update all active check-ins to be checked out
    - Set check_out_time to current timestamp for all active check-ins
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