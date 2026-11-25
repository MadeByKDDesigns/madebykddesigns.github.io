import { useState, useEffect, type FormEvent } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type VoteModalProps = {
  appName: string;
  open: boolean;
  onClose: () => void;
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function VoteModal({ appName, open, onClose }: VoteModalProps) {
  const [wantsEmail, setWantsEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const emailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = wantsEmail && emailTouched && !emailValid && email.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState('submitting');
    setErrorMsg('');

    if (wantsEmail && !emailValid) {
      setSubmitState('idle');
      setEmailTouched(true);
      return;
    }

    try {
      const { error } = await supabase.from('ios_votes').insert({
        app_name: appName,
        email: wantsEmail ? email.trim() : null,
        wants_email_notification: wantsEmail,
      });

      if (error) throw error;
      setSubmitState('success');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setSubmitState('error');
    }
  }

  function handleClose() {
    if (submitState === 'submitting') return;
    onClose();
  }

  function handleReset() {
    setWantsEmail(false);
    setEmail('');
    setEmailTouched(false);
    setSubmitState('idle');
    setErrorMsg('');
  }

  return (
    <div className="vote-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-label={`Vote for ${appName} on iOS`}>
      <div className="vote-modal" onClick={(e) => e.stopPropagation()}>
        <button className="vote-modal-close" onClick={handleClose} type="button" aria-label="Close" disabled={submitState === 'submitting'}>
          <X size={16} strokeWidth={2} />
        </button>

        {submitState === 'success' ? (
          <div className="vote-modal-success">
            <div className="vote-modal-check">
              <Check size={28} strokeWidth={2.5} />
            </div>
            <h2>You voted for {appName}!</h2>
            <p>
              {wantsEmail
                ? "We'll email you when it launches on iOS."
                : 'Thanks for your interest — we\'ll keep working on it.'}
            </p>
            <button className="vote-modal-done" onClick={handleClose} type="button">
              Done
            </button>
          </div>
        ) : (
          <form className="vote-modal-form" onSubmit={handleSubmit}>
            <h2>Vote for {appName} on iOS</h2>
            <p className="vote-modal-desc">
              Let us know you want this app on iOS. We'll prioritize the apps with the most votes.
            </p>

            <label className="vote-modal-opt-in">
              <input
                type="checkbox"
                checked={wantsEmail}
                onChange={(e) => {
                  setWantsEmail(e.target.checked);
                  if (!e.target.checked) {
                    setEmail('');
                    setEmailTouched(false);
                  }
                }}
              />
              <span>Notify me when it goes live on iOS</span>
            </label>

            {wantsEmail && (
              <div className="vote-modal-email-field">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  required
                  aria-label="Email address"
                />
                {emailError && <span className="vote-modal-email-error">Please enter a valid email address.</span>}
                <p className="vote-modal-privacy">
                  Your email will only be used to notify you when this app launches on iOS — nothing else.
                </p>
              </div>
            )}

            {submitState === 'error' && <p className="vote-modal-error">{errorMsg}</p>}

            <button className="vote-modal-submit" type="submit" disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? (
                <>
                  <Loader2 size={14} className="vote-modal-spinner" />
                  Submitting…
                </>
              ) : (
                'Cast my vote'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
