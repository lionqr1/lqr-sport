import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Trophy, Users, Calendar } from "lucide-react";
import { supabase, type Team, type League, type Match, type MatchSource, type Channel, type LiveTV } from "@/lib/supabase";

interface MatchesProps {
  onWatch: (url: string, title: string) => void;
}

interface MatchViewModel {
  id: number;
  home: Team;
  away: Team;
  league: League | null;
  time: string;
  sources: { id: number; label: string; url: string; name: string; type: 'channel' | 'stream' }[];
}

export default function Matches({ onWatch }: MatchesProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchSources, setMatchSources] = useState<MatchSource[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [streams, setStreams] = useState<LiveTV[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<Record<number, number | undefined>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [teamsRes, leaguesRes, matchesRes, matchSrcRes, chRes, tvRes] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('leagues').select('*').order('name'),
        supabase.from('matches').select('*').order('match_time', { ascending: true }),
        supabase.from('match_sources').select('*'),
        supabase.from('tv_channels').select('*'),
        supabase.from('live_tv').select('*'),
      ]);

      if (teamsRes.data) setTeams(teamsRes.data);
      if (leaguesRes.data) setLeagues(leaguesRes.data);
      if (matchesRes.data) setMatches(matchesRes.data);
      if (matchSrcRes.data) setMatchSources(matchSrcRes.data);
      if (chRes.data) setChannels(chRes.data);
      if (tvRes.data) setStreams(tvRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const vmatches = useMemo<MatchViewModel[]>(() => {
    const teamById = new Map(teams.map(t => [t.id, t] as const));
    const leagueById = new Map(leagues.map(l => [l.id, l] as const));
    const channelById = new Map(channels.map(c => [c.id, c] as const));
    const streamById = new Map(streams.map(s => [s.id, s] as const));

    const groupedSources = matchSources.reduce((acc, src) => {
      (acc[src.match_id] ||= []).push(src);
      return acc;
    }, {} as Record<number, MatchSource[]>);

    return matches.map(m => {
      const home = teamById.get(m.home_team_id)!;
      const away = teamById.get(m.away_team_id)!;
      const league = leagueById.get(m.league_id) || null;
      const sources = (groupedSources[m.id] || []).map(src => {
        if (src.source_type === 'channel') {
          const ch = channelById.get(src.source_id);
          return ch ? { id: src.id, label: src.label || ch.name, url: ch.stream_url, name: ch.name, type: 'channel' as const } : null;
        } else {
          const st = streamById.get(src.source_id);
          return st ? { id: src.id, label: src.label || st.name, url: st.stream_url, name: st.name, type: 'stream' as const } : null;
        }
      }).filter(Boolean) as MatchViewModel['sources'];
      return { id: m.id, home, away, league, time: m.match_time, sources };
    }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [teams, leagues, matches, matchSources, channels, streams]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (vmatches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">No matches available</div>
    );
  }

  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatET = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true
    }).format(d) + ' ET';
  };

  const countdownFor = (iso: string) => {
    const target = new Date(iso).getTime();
    const diff = target - nowTs;
    if (diff <= 0) return 'LIVE';
    const s = Math.floor(diff / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  return (
    <div className="space-y-4">
      {vmatches.map(match => (
        <Card key={match.id} className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Teams */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  {match.home.logo_url ? (
                    <img src={match.home.logo_url} alt={match.home.name} className="w-10 h-10 object-contain rounded shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[180px]">{match.home.name}</span>
                </div>
                <span className="text-gray-400">vs</span>
                <div className="flex items-center gap-2 min-w-0">
                  {match.away.logo_url ? (
                    <img src={match.away.logo_url} alt={match.away.name} className="w-10 h-10 object-contain rounded shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[180px]">{match.away.name}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="hidden sm:flex items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTime(match.time)}</span>
                </div>
                {match.league && (
                  <Badge className="bg-purple-600 text-white flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {match.league.name}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Select
                  value={selectedSource[match.id]?.toString()}
                  onValueChange={(val) => setSelectedSource(prev => ({ ...prev, [match.id]: Number(val) }))}
                >
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder={match.sources[0] ? `Source: ${match.sources[0].label}` : 'No sources'} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    {match.sources.map(src => (
                      <SelectItem key={src.id} value={src.id.toString()}>
                        {src.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={match.sources.length === 0}
                  onClick={() => {
                    const srcId = selectedSource[match.id] ?? match.sources[0]?.id;
                    const src = match.sources.find(s => s.id === srcId);
                    if (src) {
                      const title = `${match.home.name} vs ${match.away.name} ${match.league ? `- ${match.league.name}` : ''}`.trim();
                      onWatch(src.url, title);
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch
                </Button>
              </div>
            </div>

            {/* Mobile meta */}
            <div className="sm:hidden mt-3 flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatTime(match.time)}</span>
              </div>
              {match.league && (
                <Badge className="bg-purple-600 text-white flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {match.league.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
