-- Add approved_at column to leave_requests if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'leave_requests' and column_name = 'approved_at') then
    alter table leave_requests add column approved_at timestamp with time zone;
  end if;
end $$;

-- Create function to deduct leave balance
create or replace function deduct_leave_balance()
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
$$ language plpgsql security definer;

-- Create trigger (drop first to be safe)
drop trigger if exists on_leave_approved on leave_requests;
create trigger on_leave_approved
  after update on leave_requests
  for each row execute procedure deduct_leave_balance();
