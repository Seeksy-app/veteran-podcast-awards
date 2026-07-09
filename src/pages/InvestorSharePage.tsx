import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { INVESTOR_EMAIL_STORAGE_KEY } from '@/pages/InvestorPage';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import logo from '@/assets/vpa-logo.png';

const shell = 'min-h-screen bg-[#0A1628] text-white';
const mutedSecondary = 'text-[#94A3B8]';
const goldText = 'text-[#F59E0B]';
const cardSurface =
  'w-full max-w-md border-2 border-[#F59E0B]/20 bg-[#0F2035] shadow-[0_24px_80px_rgba(0,0,0,0.45)]';

const LinkExpiredCard = () => (
  <Card className={cardSurface}>
    <CardHeader className="space-y-4 pb-2 text-center">
      <img src={logo} alt="Veteran Podcast Awards" className="mx-auto h-24 w-24 object-contain" />
      <Clock className={`mx-auto h-10 w-10 ${goldText}`} />
      <p className="font-serif text-xl leading-snug text-white">This link has expired</p>
    </CardHeader>
    <CardContent className="pt-2 text-center">
      <p className={`${mutedSecondary} text-sm leading-relaxed`}>
        The invitation you followed is no longer active. Contact us at{' '}
        <a
          href="mailto:hello@empowerify.io"
          className={`${goldText} font-medium underline underline-offset-2`}
        >
          hello@empowerify.io
        </a>{' '}
        to request a new one.
      </p>
    </CardContent>
  </Card>
);

const InvestorSharePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [redeemFailed, setRedeemFailed] = useState(false);

  const { data: linkStatus, isLoading } = useQuery({
    queryKey: ['investor-share-link-status', token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_investor_share_link_status', {
        p_token: token ?? '',
      });
      if (error) throw error;
      return data?.[0] ?? { label: null, status: 'not_found' };
    },
    enabled: Boolean(token),
    retry: false,
  });

  const redeemMutation = useMutation({
    mutationFn: async (emailInput: string) => {
      const { data, error } = await supabase.rpc('redeem_investor_share_link', {
        p_token: token ?? '',
        p_email: emailInput,
      });
      if (error) throw error;
      return data?.[0] ?? { status: 'not_found', email: null };
    },
    onSuccess: (result) => {
      if (result.status === 'valid' && result.email) {
        localStorage.setItem(INVESTOR_EMAIL_STORAGE_KEY, result.email);
        toast.success('Access granted');
        navigate('/prospectus');
      } else if (result.status === 'invalid_email') {
        toast.error('Please enter a valid email address');
      } else {
        // Link died between page load and submit (expired or revoked).
        setRedeemFailed(true);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Unable to verify this link. Check your connection and try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Please enter your email address');
      return;
    }
    redeemMutation.mutate(trimmed);
  };

  const containerClass = `${shell} flex min-h-screen flex-col items-center justify-center px-4 py-12`;

  if (!token || isLoading) {
    return (
      <div className={containerClass}>
        <Card className={cardSurface}>
          <CardHeader className="space-y-3 text-center">
            <img src={logo} alt="VPA" className="mx-auto h-20 w-20 object-contain" />
            <CardDescription className={`${mutedSecondary} text-base`}>
              {token ? 'Checking your invitation…' : 'Invalid link'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (linkStatus?.status !== 'valid' || redeemFailed) {
    return (
      <div className={containerClass}>
        <LinkExpiredCard />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Card className={cardSurface}>
        <CardHeader className="space-y-4 pb-2 text-center">
          <img src={logo} alt="Veteran Podcast Awards" className="mx-auto h-24 w-24 object-contain" />
          <p className="font-serif text-lg leading-snug text-white md:text-xl">
            You've been invited to view the investor deck
          </p>
          <p className={`${mutedSecondary} text-sm`}>Enter your email to continue</p>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="share-email" className={`${mutedSecondary} text-sm font-medium`}>
                Email
              </Label>
              <Input
                id="share-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 border-[#F59E0B]/35 bg-[#0A1628] text-white ring-offset-[#0A1628] placeholder:text-[#94A3B8]/60 focus-visible:border-[#F59E0B] focus-visible:ring-[#F59E0B]/30"
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full bg-[#F59E0B] text-base font-semibold text-[#0A1628] shadow-sm transition-colors hover:bg-[#FBBF24]"
              disabled={redeemMutation.isPending}
            >
              {redeemMutation.isPending ? 'Verifying…' : 'View Investor Deck'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorSharePage;
