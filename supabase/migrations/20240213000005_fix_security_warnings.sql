-- Fix "Function Search Path Mutable" warning
-- When using 'security definer', strict search_path must be set to prevent hijacking.

create or replace function public.deduct_leave_balance()
returns trigger as $$
declare
  v_days integer;
begin
  -- Only proceed if status changed to approved
  if (old.status != 'approved' and new.status = 'approved') then
    -- Calculate duration
    v_days := (new.end_date - new.start_date) + 1;
    
    -- Update balance based on leave type
    if (new.leave_type = 'Annual') then
      update leave_balances set annual_used = annual_used + v_days where user_id = new.user_id;
    elsif (new.leave_type = 'Sick') then
      update leave_balances set sick_used = sick_used + v_days where user_id = new.user_id;
    elsif (new.leave_type = 'Casual') then
      update leave_balances set casual_used = casual_used + v_days where user_id = new.user_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;
