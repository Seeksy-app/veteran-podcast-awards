import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TABLES = [
  'podcast_contacts',
  'deck_engagement_events',
  'investor_engagement_events',
  'investor_access',
  'mailing_lists',
  'pre_registrations',
  'profiles',
  'smart_lists',
] as const;

type TableName = typeof TABLES[number];

const ExportData = () => {
  const [status, setStatus] = useState<Record<string, string>>({});

  const download = async (table: TableName) => {
    setStatus(s => ({ ...s, [table]: 'fetching...' }));
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(s => ({ ...s, [table]: `✓ ${data.length} rows` }));
    } catch (e: any) {
      setStatus(s => ({ ...s, [table]: `✗ ${e.message}` }));
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h1>Data Export (Admin)</h1>
      <p>You must be signed in as admin for RLS-protected tables.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {TABLES.map(t => (
          <li key={t} style={{ margin: '12px 0' }}>
            <button onClick={() => download(t)} style={{ marginRight: 12 }}>
              Download {t}.json
            </button>
            <span>{status[t] || ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExportData;
