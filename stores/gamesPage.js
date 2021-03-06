import { chunk } from "lodash";
import { useEffect, useRef, useState } from "react";
import { createContainer } from "unstated-next";
import getFlag from "../lib/getFlag";
import { getGameList, getGameSorts } from "../services/games";
import { multiGetUniverseIcons } from "../services/thumbnails";

const selectorSorts = [
  {
    name: 'All',
    value: 'all',
    id: 0,
  },
  {
    name: 'Adventure',
    value: 'adventure',
    id: 7,
  },
  {
    name: 'Building',
    value: 'building',
    id: 13,
  },
  {
    name: 'Comedy',
    value: 'comedy',
    id: 9,
  },
  {
    name: 'Fighting',
    value: 'fighting',
    id: 4,
  },
  {
    name: 'FPS',
    value: 'fps',
    id: 14,
  },
  {
    name: 'Horror',
    value: 'horror',
    id: 5,
  },
  {
    name: 'Medieval',
    value: 'medieval',
    id: 2,
  },
  {
    name: 'Military',
    value: 'military',
    id: 11,
  },
  {
    name: 'Naval',
    value: 'naval',
    id: 6,
  },
  {
    name: 'RPG',
    value: 'rpg',
    id: 15,
  },
  {
    name: 'Sci-Fi',
    value: 'sci-fi',
    id: 3,
  },
  {
    name: 'Sports',
    value: 'sports',
    id: 8,
  },
  {
    name: 'Town and City',
    value: 'town and city',
    id: 1,
  },
  {
    name: 'Western',
    value: 'western',
    id: 10,
  }
];

const GamesPageStore = createContainer(() => {
  const [sorts, setSorts] = useState(null);
  const [games, setGames] = useState(null);
  const iconsRef = useRef({})
  const [icons, setIconsInternal] = useState({});
  const setIcons = newIcons => {
    setIconsInternal(newIcons);
    iconsRef.current = newIcons;
  }
  const [genreFilter, setGenreFilter] = useState(null);
  const genreFilterMethod = getFlag('gameGenreFilterMethod', 'default'); // default = genre query param, keyword = add to search keyword

  const setInitialSorts = () => {
    getGameSorts({ gameSortsContext: 'GamesDefaultSorts' }).then(d => {
      setSorts(d.sorts);
      let games = {};
      let promises = [];
      let pendingIconUniverseIds = [];
      for (const item of d.sorts) {
        promises.push(getGameList({
          sortToken: item.token,
          limit: 100,
        }).then(d => {
          games[item.token] = d.games;
          d.games.forEach(v => {
            if (pendingIconUniverseIds.includes(v.universeId)) return;
            pendingIconUniverseIds.push(v.universeId);
          })
        }));
      }
      Promise.all(promises).then(() => {
        setGames(games);
        let split = chunk(pendingIconUniverseIds, 100);
        for (const pendingIconUniverseIds of split) {
          multiGetUniverseIcons({
            universeIds: pendingIconUniverseIds,
            size: '150x150',
          }).then(result => {
            let obj = { ... (iconsRef.current || {}) }
            for (const item of result) {
              obj[item.targetId] = item.imageUrl;
            }
            setIcons({ ...obj });
          })
        }
      })
    });
  }

  useEffect(() => {
    if (genreFilter === 'default' || genreFilter === null || genreFilter === 'all') {
      setInitialSorts();
    } else {
      setSorts([
        {
          displayName: '',
          token: 'fakeListGenreFilter',
        }
      ]);
      getGameList({
        sortToken: 'fakeListGenreFilter',
        limit: 100,
        genre: selectorSorts.find(v => v.value === genreFilter).id,
      }).then(newGames => {
        setGames({
          fakeListGenreFilter: newGames.games,
        });
      })

    }
  }, [genreFilter]);

  return {
    sorts,
    games,
    icons,

    genreFilter,
    setGenreFilter,
    selectorSorts,
  }
});

export default GamesPageStore;