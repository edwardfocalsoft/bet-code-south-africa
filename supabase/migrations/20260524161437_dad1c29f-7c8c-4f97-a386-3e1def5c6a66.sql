
-- Bot prevention trigger on auth.users
CREATE OR REPLACE FUNCTION public.prevent_bot_signups()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(coalesce(NEW.email, ''));
  v_domain text;
BEGIN
  IF v_email = '' THEN
    RETURN NEW;
  END IF;

  v_domain := split_part(v_email, '@', 2);

  -- Block known disposable / temp email providers
  IF v_domain IN (
    'mailinator.com','guerrillamail.com','guerrillamail.info','sharklasers.com',
    'tempmail.com','temp-mail.org','temp-mail.io','10minutemail.com','10minutemail.net',
    'yopmail.com','trashmail.com','throwawaymail.com','maildrop.cc','getairmail.com',
    'mintemail.com','mohmal.com','dispostable.com','fakeinbox.com','mailnesia.com',
    'mytemp.email','emailondeck.com','spambox.us','tempinbox.com','tempmailaddress.com',
    'mailcatch.com','mailnull.com','spam4.me','tempr.email','tmpmail.net','tmpmail.org',
    'tmpeml.com','linshiyou.com','byom.de','jetable.org','nada.email','fakemail.net'
  ) THEN
    RAISE EXCEPTION 'Disposable email addresses are not allowed';
  END IF;

  -- Block obvious bot-style usernames
  IF v_email ~ '^(bot|test|spam|crawler|scraper|fake|temp)[0-9_\.\-]*@' THEN
    RAISE EXCEPTION 'Suspicious account pattern detected';
  END IF;

  -- Block emails containing long digit runs commonly used by bot farms (e.g. abc83746273@gmail.com)
  IF v_email ~ '[0-9]{8,}' THEN
    RAISE EXCEPTION 'Suspicious account pattern detected';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_bot_signups_trigger ON auth.users;
CREATE TRIGGER prevent_bot_signups_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_bot_signups();
