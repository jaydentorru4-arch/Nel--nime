import React, { useState } from 'react';
import { Play, Check, Clock, Search, Layers } from 'lucide-react';
import { Anime, Episode, Season } from '../types/anime';

interface EpisodeListProps {
  anime: Anime;
  currentEpisode: Episode;
  onSelectEpisode: (ep: Episode) => void;
  selectedSeasonNumber?: number;
  onSelectSeason?: (seasonNum: number) => void;
  getEpisodeProgress?: (episodeNumber: number) => number; // returns percentage 0 - 100
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  anime,
  currentEpisode,
  onSelectEpisode,
  selectedSeasonNumber = 1,
  onSelectSeason,
  getEpisodeProgress,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [internalSeasonNum, setInternalSeasonNum] = useState(
    currentEpisode.seasonNumber || selectedSeasonNumber || 1
  );

  const activeSeasonNum = onSelectSeason ? selectedSeasonNumber : internalSeasonNum;

  // Find episodes for the active season, or fallback to anime.episodes
  const availableSeasons: Season[] = anime.seasons || [
    { seasonNumber: 1, title: 'Season 1', episodes: anime.episodes }
  ];

  const currentSeason = availableSeasons.find(
    (s) => s.seasonNumber === activeSeasonNum
  ) || availableSeasons[0];

  const seasonEpisodes = currentSeason?.episodes || anime.episodes;

  const filteredEpisodes = seasonEpisodes.filter(
    (ep) =>
      ep.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.number.toString().includes(searchFilter)
  );

  const handleSeasonChange = (sNum: number) => {
    setInternalSeasonNum(sNum);
    if (onSelectSeason) onSelectSeason(sNum);
  };

  return (
    <div className="bg-[#14151a] rounded-2xl border border-zinc-800 p-4 sm:p-5 flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Episodes & Seasons</h3>
          <p className="text-xs text-zinc-400">
            {currentSeason ? currentSeason.title : 'Season 1'} ({seasonEpisodes.length} Episodes)
          </p>
        </div>

        {/* Quick Filter */}
        <div className="relative w-36 sm:w-44">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ep..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-zinc-900 text-xs text-white placeholder-zinc-500 pl-8 pr-2.5 py-1.5 rounded-lg border border-zinc-700/60 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Season Selection Pills */}
      {availableSeasons.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {availableSeasons.map((s) => (
            <button
              key={s.seasonNumber}
              onClick={() => handleSeasonChange(s.seasonNumber)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSeasonNum === s.seasonNumber
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Season {s.seasonNumber}
            </button>
          ))}
        </div>
      )}

      {/* Episode items list */}
      <div className="divide-y divide-zinc-800/40 overflow-y-auto max-h-[500px] pr-1 space-y-1">
        {filteredEpisodes.map((ep) => {
          const isCurrent =
            ep.number === currentEpisode.number &&
            (ep.seasonNumber || 1) === (currentEpisode.seasonNumber || 1);
          const progressPercent = getEpisodeProgress ? getEpisodeProgress(ep.number) : 0;

          return (
            <button
              key={ep.id}
              onClick={() => onSelectEpisode(ep)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3.5 text-left transition-all group cursor-pointer ${
                isCurrent
                  ? 'bg-violet-950/70 border border-violet-500/50 shadow-md shadow-violet-900/20'
                  : 'hover:bg-zinc-850/60 border border-transparent'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                <img
                  src={ep.thumbnail}
                  alt={ep.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Playing indicator or play icon on hover */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                    isCurrent
                      ? 'bg-violet-950/70 opacity-100'
                      : 'bg-black/50 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Play
                    className={`w-4 h-4 fill-current ${
                      isCurrent ? 'text-violet-300' : 'text-white'
                    }`}
                  />
                </div>

                {/* Duration badge */}
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                  {ep.duration}
                </span>

                {/* Progress bar */}
                {progressPercent > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Title & info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    EP {ep.number}
                  </span>
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent
                        ? 'text-violet-300'
                        : 'text-zinc-200 group-hover:text-white'
                    }`}
                  >
                    {ep.title}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-1 mt-1">
                  {ep.synopsis}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
